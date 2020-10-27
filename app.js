//initialize express and a port
const express = require('express');
const session = require('express-session')
const app = express();
const dotenv = require("dotenv").config();
const port = process.env.PORT;
const subdomain = require("express-subdomain");

//import the api router
const api = require("./api/api");

//initiate sessions on the server
app.use(session({
    secret: 'a294574146b43e26305be988b289c70b17cb1409315c91f9924241dbdc683bc38d203bfdb731270235634aa84613916d8e90ffa9442c3fed459ff1da42f3089e',
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: false,
        secure: false,
        maxAge: 2000000
    }
}))


//serve api from the api router
app.use(subdomain('api', api));

//serve static resources from the public folder
app.use((req, res, next) => {console.log(req.session.account); next();}, express.static(__dirname + "/public", { extensions:['html'] }));

//check if user logged in, if so then serve /user
const auth = require("./authenticateUser")
app.use(auth, express.static(__dirname + "/user", { extensions:['html'] }))

app.get('*', (req, res) => {res.redirect('/')})

//start server
app.listen(port, () => {console.log(`Server running on port ${port}`)});

 