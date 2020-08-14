const mysql = require("mysql");

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'NHS',
    port: '3306'
});

connection.connect((err) => {
    if (err) throw err;
});

module.exports =  connection;