//initialize express and its router
const express = require("express");
const router = express.Router();

//CORS
const cors = require("cors");
router.use(
    cors({
        credentials: true,
        origin: "http://www.bpnhs.org",
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

//get events like 
router.get("/eventslike/:eventq?", (req, res) => {
    if(req.params.eventq){
        let event_query = connection.escape('%'+req.params.eventq+'%');
        let query = `SELECT * FROM events WHERE event_name LIKE ${event_query}`;

        connection.query(query, (err,rows) => {
            if(err) throw err;
            
            res.send(rows);
            return;
        });
    } 
    else { 
        res.send([]);
    }
});

//get members like
router.get("/memberslike/:memberq?", (req, res) => {
    let auth = authority(req);
    if(auth > 1) { 
        let query = `SELECT * FROM accounts WHERE name LIKE ${connection.escape('%' + req.params.memberq + '%')}`;
        query += auth == 3 ? '' : ` AND committee = '${req.session.account.committee}'`;
        connection.query(query, (err, rows) => {
            if(err) throw err;

            res.send(rows);
        });
    } else { 
        res.sendStatus(403);
    }
})


router.get("/img", (req, res) => {
    res.sendFile('__dirname+/uploads/event-pic-1599279569819.jpg')
})

//Event signup submission
router.post("/eventsignup", urlencodedParser, (req, res) => {
    if(authority(req) != 0) {
        let event_id;
        let query = `SELECT id from events WHERE event_name = ${connection.escape(req.body.eventname)}`;
        connection.query(query, (err, rows) => {
            if(err) throw err;
            if(rows.length == 0) { 
                res.send({status : "Event does not exist"});
                return;
            }

            event_id = rows[0].id;
            query = `SELECT * FROM signups WHERE account_id = ${req.session.account.id} AND event_id = ${event_id}`;
            connection.query(query, (err, rows) => {
                if(err) throw err;
                if(rows.length != 0) return res.send({status: 'Already signed up for event'});

                query = `INSERT INTO signups (account_id, event_id, time_start, time_end) VALUES (
                    ${req.session.account.id},
                    ${event_id},
                    ${connection.escape(req.body.timestart)},
                    ${connection.escape(req.body.timeend)}
                )`;
                connection.query(query, (err) => { 
                    if(err) throw err;
        
                    res.send({status: 'success'});
                    return;
                });
            });
        });
        //console.log(event_id);
    }
    else { 
        console.log("unauthorized");
        res.sendStatus(403);
    }
});

//Hours log Form submission
router.post("/submithours", (req, res) => {
    if(authority(req) != 0) {
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

                res.send({status : 'success'});
            })
        });
    } else {
        res.send(403);
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

router.get("/logout", (req, res) => {
    req.session.account = null;
    res.send({status : "success"});
})

//handle registration requests 
router.post("/register", urlencodedParser, (req, res) => {
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
        let query = `SELECT attendance_status, meeting_name, meeting_time FROM attendance a INNER JOIN meetings m ON a.meeting_id = m.id WHERE a.account_id = ${req.session.account.id} ORDER BY m.meeting_time`;
        connection.query(query, (err, rows) => { 
            if(err) throw err;

            res.send(rows);
        });
    } else {
        res.sendStatus(403);
    }
})

//get committee members by committee
router.get("/:committee/committeemembers", (req, res) => {
    let auth = authority(req);
    if(auth == 3 || (auth == 2 && req.params.committee == req.session.account.committee)) {
        let query = `SELECT name FROM accounts WHERE committee = ${connection.escape(req.params.committee)}`;
        connection.query(query, (err, rows) => { 
            if (err) throw err;

            res.send(rows);
        });
    } else { 
        res.sendStatus(403);
    }
});

//get committee meetings
router.get("/:committee/committeemeetings", (req, res) => {
    let auth = authority(req);
    if(auth == 3 || (auth == 2 && req.params.committee == req.session.account.committee)) {
        let query = `SELECT meeting_name, meeting_description, meeting_time FROM meetings WHERE meeting_committee = ${connection.escape(req.params.committee)}`;
        connection.query(query, (err, rows) => {
            if (err) throw err;

            res.send(rows);
        });
    } else {
        res.sendStatus(403);
    }
})

//get committee attendance records
router.get("/:committee/committeeattendance", (req, res) => {
    let auth = authority(req);
    if(auth == 3 || (auth == 2 && req.params.committee == req.session.account.committee)) {
        let query = `SELECT meeting_name, attendance_status, meeting_time, meeting_committee, committee, name, email, status FROM attendance INNER JOIN meetings ON attendance.meeting_id = meetings.id INNER JOIN accounts ON attendance.account_id = accounts.id WHERE accounts.committee= ${connection.escape(req.params.committee)}`;
        connection.query(query, (err, rows) => {
            if (err) throw err;

            res.send(rows);
        });
    } else {
        res.sendStatus(403);
    }
});

//get member info 
router.get("/:member/memberinfo", (req, res) => {
    let auth = authority(req);
    if(auth > 1) { 
        let query = `SELECT name, committee, email FROM accounts WHERE name = ${connection.escape(req.params.member)}`;
        query += auth == 3 ? '' : ` AND committee = '${req.session.account.committee}'`;
        connection.query(query, (err, rows) => {
            if (err) throw err;

            res.send(rows[0]);
        });
    } else { 
        res.sendStatus(403);
    }
});

//get member attendance 
router.get("/:member/memberattendance", (req, res) => {
    let auth = authority(req);
    if(auth > 1) { 
        let query = `SELECT meeting_name, meeting_time, attendance_status FROM attendance INNER JOIN meetings ON attendance.meeting_id = meetings.id WHERE attendance.account_id = (SELECT id FROM accounts WHERE name = ${connection.escape(req.params.member)}`;
        query += auth == 3 ? ')' : ` AND committee = '${req.session.account.committee}')`;
        connection.query(query, (err, rows) => {
            if (err) throw err;

            res.send(rows);
        });
    } else { 
        res.sendStatus(403);
    }
});

//get member info 
router.get("/:member/memberhours", (req, res) => {
    let auth = authority(req);
    if(auth > 1) { 
        let query = `SELECT event_name, event_date, hours, status FROM service WHERE account_id = (SELECT id FROM accounts WHERE name = ${connection.escape(req.params.member)}`;
        query += auth == 3 ? ')' : ` AND committee = '${req.session.account.committee}')`;
        connection.query(query, (err, rows) => {
            if (err) throw err;

            res.send(rows);
        });
    } else { 
        res.sendStatus(403);
    }
});

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

//get meeting attendance data
router.get("/meetings/:meetingdate/:meetingname/attendance", (req, res) => {
    let auth = authority(req);
    if(auth > 1) {
        if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(req.params.meetingdate)) return res.sendStatus(400);
        let date = new Date(req.params.meetingdate);
        date = date.getFullYear() + "-" + (date.getMonth()+1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0");
        let query = `SELECT name, committee, attendance_status 
                    FROM attendance 
                    INNER JOIN accounts ON attendance.account_id = accounts.id 
                    INNER JOIN meetings ON attendance.meeting_id = meetings.id
                    WHERE meetings.meeting_name = ${connection.escape(req.params.meetingname)} AND meetings.meeting_time = ${connection.escape(date)}`;
        query += auth == 3 ? '' : ` AND meetings.meeting_committee = '${req.session.account.committee}'`;

        connection.query(query, (err, rows) => {
            if(err) throw err;

            res.send(rows);
        }); 
    } else {
        res.sendStatus(403);
    }
});

//update meeting attendance member status
router.get("/meetings/:meetingdate/:meetingname/attendance/updatemember/:member/:attendancestatus", (req, res) => {
    let auth = authority(req);
    if(auth > 1) {
        if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(req.params.meetingdate)) return res.sendStatus(400);
        let date = new Date(req.params.meetingdate);
        date = date.getFullYear() + "-" + (date.getMonth()+1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0");
        let query = `UPDATE attendance INNER JOIN accounts ON attendance.account_id = accounts.id INNER JOIN meetings ON attendance.meeting_id = meetings.id
                    SET attendance.attendance_status = '${req.params.attendancestatus === 'present' ? 1 : 0}'
                    WHERE accounts.name = ${connection.escape(req.params.member)} 
                    AND attendance.meeting_id = (SELECT id FROM meetings WHERE meeting_name = ${connection.escape(req.params.meetingname)} AND meeting_time = ${connection.escape(date)})`;
        query += auth == 3 ? '' : ` AND meetings.meeting_committee = '${req.session.account.committee}'`;
        connection.query(query, (err, rows) => {
            if(err) throw err;

            res.send({status : 'success'});
        }); 
    } else {
        res.sendStatus(403);
    }
});



router.all('*', (req, res) => {return res.sendStatus(404)}) 

//export the api router
module.exports = router;