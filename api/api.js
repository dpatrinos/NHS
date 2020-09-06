//initialize express and its router
const express = require("express");
const router = express.Router();

//CORS
const cors = require("cors");
router.use(
    cors({
        credentials: true,
        origin: "http://bpnhs.org:3000",
    })
)

//bcrypt for password hashing
const bcrypt = require('bcrypt');

//initialize mysql connection
const connection = require("./connection");

//path for relocating files
const path = require('path');

//body parser for parsing forms and multer for multi part
const bodyParser = require("body-parser");
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, __dirname + '/uploads/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        req.finalfilename = file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        cb(null, req.finalfilename);
    }
});
const upload = multer({ 
    storage: storage,
    fileFilter(req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg" && ext !== ".pdf" && ext !== ".heic") {
            req.fileValidationError = 'Only image files are allowed!';
            cb(new Error("Error: Unacceptable file format"), false);
        } else {
            cb(null, true);
        }
    }
});

const urlencodedParser = bodyParser.urlencoded({ extended: false });

//Get level of authority
const authority = (req) => {
    if(req.session.account) { 
        switch (req.session.account.status) {
            case "member":
                return 1
                break;
            case "chair":
                return 2
                break;
            case "officer":
                return 3
                break;
        }       
    } else {
        return 0;
    }
}

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

//Hours log Form submission
router.post("/submithours", (req, res) => {
    if(req.session.account) {
        let hourFormUpload = upload.single('eventpic');
        hourFormUpload(req, res, (err) => {
            
            if (req.fileValidationError) {
                return res.send({ status: 'Forbidden file type'});
            }
            else if (!req.file) {
                return res.send({ status : 'No image uploaded'});
            }
            else if (err instanceof multer.MulterError) {
                return res.send(err);
            }
            else if (err) {
                return res.send(err);
            }
            
            let query = `INSERT INTO service (account_id, event_name, hours, event_date, img_name) VALUES (
                ${req.session.account.id},
                ${connection.escape(req.body.eventname)},
                ${connection.escape(req.body.eventhours)},
                ${connection.escape(req.body.eventdate)},
                ${connection.escape(req.finalfilename)})`;
            
            connection.query(query, (err) => {
                if (err) throw err;

                res.send({status : 'status'});
            })
        });
    } else {
        res.send(403);
    }
});

router.get("/img", (req, res) => {
    res.sendFile('/mnt/c/Users/bplax/Desktop/Projects/NHS/api/uploads/event-pic-1599279569819.jpg')
})

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
    console.log(req.body);
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
    console.log(authority(req));
    if(req.session.account) { 
        res.send({name: req.session.account.name, committee: req.session.account.committee, status: req.session.account.status});
    } else {
        res.send({});
    }
});


//get user's past events (submitted)
router.get("/currentUser/pastevents", (req, res) => {
    if(req.session.account != null) { 
        let query = `SELECT event_name, hours, status, event_date FROM service WHERE account_id = ${req.session.account.id} ORDER BY event_date`;
        connection.query(query, (err, rows) => {
            if (err) throw err;

            res.send(rows);
        });
    } else {
        res.sendStatus(403);
    }
});

//get user's attendance record
router.get("/currentUser/attendance", (req, res) => { 
    if(req.session.account != null) {
        let query = `SELECT status, meeting_name, meeting_time FROM attendance a INNER JOIN meetings m ON a.meeting_id = m.id WHERE a.account_id = ${req.session.account.id} ORDER BY m.meeting_time`;
        connection.query(query, (err, rows) => { 
            if(err) throw err;

            res.send(rows);
        });
    } else {
        res.sendStatus(403);
    }
})

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