$.ajax({
    type: 'get',
    url: 'http://api.bpnhs.org:3000/currentUser',
    crossDomain: true,
    xhrFields: {
        withCredentials: true
    },
    success: (data) => {
      if(!data.name) {
        location.href = '/login';
      } 
    }
  })

$("#hours-request").submit((e) => {
    e.preventDefault();
    let data = new FormData($("#hours-request")[0]);
    console.log(data.get('event-pic'));
    $.ajax({
        type: 'post',
        url: 'http://api.bpnhs.org:3000/submithours',
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },
        data: data,
        processData: false,
        contentType: false,
        success: function (res) {
            console.log(res);
            if(res.status == "logged in") { 
                location.href = "dashboard"
            }   
        }
    });
});