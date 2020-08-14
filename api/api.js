//initialize express and its router
const express = require("express");
const router = express.Router();

//tools to read form encodings
const bodyParser = require('body-parser');
const multer = require('multer')
const upload = multer();

router.use(upload.array());

//bcrypt for password hashing
const bcrypt = require('bcrypt');

//initialize mysql connection
const connection = require("./connection");

//handle get requests to the events endpoint
router.get("/events/:id?", (req, res) => { 
    let query;
    if (req.params.id == null) {
        query = "SELECT * FROM events ORDER BY event_time";
    }
    else {
        query = `SELECT * FROM events WHERE id = ${connection.escape(req.params.id)}`
    }

    connection.query(query, (err,rows) => {
        if(err) throw err;
        
        res.send(rows);
        return;
    });
});

//handle post requests to login endpoint
const loginSession = require('./accountLogin');
router.post("/login", (req, res) => {
    console.log(req.session.account);
    loginSession(req.body.email, req.body.password, (result, account) => {
        if(result) { 
            req.session.account = account;
            res.send({status : "logged in"});
        } else {
            res.send({status : "password incorrect"});
        }
    })
});

//handle registration requests 
router.post("/register", (req, res) => {
    verifyData(req.body, (status) => {
        if(status != "valid") { 
            res.send({ "status" : status })
            return;
        }

        bcrypt.hash(req.body.password, 10, function(err, hash) {
            let query = `INSERT INTO accounts (name, password, email) VALUES (${connection.escape(req.body.firstname + " " + req.body.lastname)}, ${connection.escape(hash)}, ${connection.escape(req.body.email)})`;
            connection.query(query, (err,rows) => {
                if(err) throw err;

                res.send({"status" : "success"});
            });
        });
    });   
});

const verifyData = (data, cb) => {  
    let passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    if(!passwordRegex.test(data.password)) {
         cb("Invalid password");
    }

    let query = `SELECT * FROM accounts WHERE email = ${connection.escape(data.email)}`;
    
    connection.query(query, (err,rows) => {
        if(err) throw err;
        
        if(rows.length != 0) { 
            cb("Email already exists.");
        }
        else {
            cb("valid")
        }
    });
}

//get user information
router.get("/currentUser", (req, res) => { 
    if(req.session.account != null) { 
        res.send({name: req.session.account.name});
    } else {
        res.status(404);
    }
});



//export the api router
module.exports = router;