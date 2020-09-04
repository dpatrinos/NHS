//initialize express and its router
const express = require("express");
const router = express.Router();

//CORS
const cors = require("cors");
router.use(
    cors({
        credentials: true,
        origin: "http://example.com",
    })
)

//bcrypt for password hashing
const bcrypt = require('bcrypt');

//initialize mysql connection
const connection = require("./connection");

//body parser for parsing forms
const bodyParser = require("body-parser");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

//get event
router.get("/events/:eventname?", (req, res) => {
    let query;
    let account_status;
    if (req.params.eventname == null) {
        query = "SELECT * FROM events ORDER BY event_time DESC";
    }
    else {
        let event_name = connection.escape(req.params.eventname);
        if(req.session.account) {
            query = `SELECT * FROM participation WHERE account_id = ${req.session.account.id} AND event_name = ${event_name}`;
            connection.query(query, (err,rows) => {
                if(err) throw err;

                account_status = rows.length != 0 ? 1 : 0;
            });
        }
        query = `SELECT * FROM events WHERE event_name = ${event_name}`
    }

    connection.query(query, (err,rows) => {
        if(err) throw err;

        if(account_status) { 
            rows[0].account_status = account_status;
        }
        
        res.send(rows);
        return;
    });
});

//hnadle get reqests to event signup
router.get("/eventSignup/:eventname", (req, res) => { 

    //escape the 'eventname' parameter
    let eventname = connection.escape(req.params.eventname);

    //Check if signed in
    if(req.session.account) { 

        //Make sure event exists / is for the correct committee of the user
        let query = `SELECT * FROM events WHERE event_name = ${eventname}`;
        connection.query(query, (err, rows) => { 
            if(err) throw err;

            if(rows.length === 0 || (rows[0].committee != 'ALL' && rows[0].committee != req.session.account.role)) {
                res.send({'status' : 'failure', 'error' : 'Permission denied'});
                return;
            }

            //Make sure event has not already been signed up for by user
            query = `SELECT * FROM participation WHERE account_id = ${req.session.account.id} AND event_name = ${eventname}`;
            connection.query(query, (err, rows) => {
                if(err) throw err;

                if(rows.length != 0) {
                    res.send({'status' : 'failure', 'error' : 'You are already signed up for this event'});
                    return;
                }

                //If all above parameter queries are met, insert the signup information into participation
                query = `INSERT INTO participation (account_id, event_name) VALUES (${req.session.account.id}, ${eventname})`;
                connection.query(query, (err) => { 
                    if(err) throw err;

                    res.send({'status' : 'success'});
                    return;
                });
            });     
        });
    }
    else {
        //Return forbidden without account session active
        res.sendStatus(403);
    }
});


//handle post requests to login endpoint
const loginSession = require('./accountLogin');
router.post("/login", urlencodedParser, (req, res) => {
    if(req.body.email && req.body.password) {
        loginSession(req.body.email, req.body.password, (result, account) => {
            if(result) { 
                req.session.account = account;
                res.send({status : "logged in"});
            } else {
                res.send({status : "password incorrect"});
            }
        })
    } else {
        return res.sendStatus(403);
    }
});

//handle registration requests 
router.post("/register", urlencodedParser, (req, res) => {
    console.log(req.body)
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
    if(req.session.account) { 
        res.send({name: req.session.account.name, committee: req.session.account.committee});
    } else {
        res.send({});
    }
});


//get user attendance
router.get("/currentUser/pastevents", (req, res) => {
    if(req.session.account != null) { 
        let query = `SELECT event_name, hours, status, event_date FROM service WHERE account_id = ${req.session.account.id}`;
        connection.query(query, (err, rows) => {
            if (err) throw err;

            res.send(rows);
        });
    } else {
        res.sendStatus(403);
    }
});

//get committee attendance records
router.get("/committeeAttendance/:committee?", (req, res) => {
    if(req.session.account && req.session.account.status != 'member') {
        if(req.params.committee == null && req.session.account.role === 'ALL') {
            let query = `SELECT event_name, participated, event_time, committee, name, email, role FROM participation INNER JOIN events USING (event_name) INNER JOIN accounts ON participation.account_id = accounts.id`;
            connection.query(query, (err, rows) => {
                if (err) throw err;

                res.send(rows);
            });
        } else if(req.session.account.role == req.params.committee || req.session.account.role === 'ALL') { 
            let query = `SELECT event_name, participated, event_time, committee, name, email, role FROM participation INNER JOIN events USING (event_name) INNER JOIN accounts ON participation.account_id = accounts.id WHERE events.committee = ${connection.escape(req.params.committee)}`;
            connection.query(query, (err, rows) => {
                if (err) throw err;

                res.send(rows);
            });
        }
    } else {
        res.sendStatus(403);
    }
});

router.all('*', (req, res) => {return res.sendStatus(404)}) 

//export the api router
module.exports = router;