const connection = require("./connection");
const bcrypt = require('bcrypt');

const loginSession = (email, password, cb) => {
    let query = `SELECT * FROM accounts WHERE email = ${connection.escape(email)}`
    connection.query(query, (err, rows) => {
        if(err) throw err;
        bcrypt.compare(password, rows[0].password, (err, same) => {
            if(err) throw err;
            cb(same, rows[0]);
        })
    });
}

module.exports = loginSession;


