$("#login-form").submit((e) => {
    e.preventDefault();
    let data = $("#login-form").serialize()
    $.ajax({
        type: 'post',
        url: 'http://api.bpnhs.org:3000/login',
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
