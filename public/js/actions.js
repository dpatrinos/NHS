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
    let data = $("#hours-request").serialize();
    console.log(data);
});