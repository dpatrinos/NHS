("#login-form").submit((e) => {
    e.preventDefault();
    let data = $("#login-form").serialize()
    console.log(data);
    setTimeout(() => {}, 5000)
    $.ajax({
        type: 'post',
        url: 'http://api.bpnhs.org/login',
        data: data,
        success: function (res) {
            if(res.status == "logged in") { 
                location.href = "dashboard"
            }   
        }
    });
})
