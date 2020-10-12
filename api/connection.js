const mysql = require("mysql");
const dotenv = require("dotenv").config();

const connection = mysql.createConnection(process.env.JAWSDB_MARIA_URL);
/*
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASS,
    database: 'NHS',
    port: '3306'
});
*/
connection.connect((err) => {
    if (err) throw err;
});

module.exports =  connection;