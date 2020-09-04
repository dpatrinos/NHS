$("#login-form").submit((e) => {
    e.preventDefault();
    let data = $("#login-form").serialize()
    $.ajax({
        type: 'post',
        url: 'http://api.example.com/login',
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },
        data: data,
        success: function (res) {
            if(res.status == "logged in") { 
                location.href = "dashboard"
            }   
        }
    });
})