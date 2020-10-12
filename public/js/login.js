const dotenv = require("dotenv").config();
const port = process.env.PORT;
const apiPath = 'http://api.bpnhs.org:' + port;

("#login-form").submit((e) => {
    e.preventDefault();
    let data = $("#login-form").serialize()
    $.ajax({
        type: 'post',
        url: apiPath + '/login',
        data: data,
        success: function (res) {
            if(res.status == "logged in") { 
                location.href = "dashboard"
            }   
        },
        error: function(res) {
            $('#login-fail').show();
        }
    });
})
