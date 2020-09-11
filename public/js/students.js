$.ajax({
    type: 'get',
    url: 'http://api.bpnhs.org:3000/currentUser',
    crossDomain: true,
    xhrFields: {
        withCredentials: true
    },
    success: (data) => {
      if(!data.name) {
        location.href = "/login";
      }
    }
  })
  

$("#student-lookup").keyup(e => {
    if (e.which == 16) return;
    $("#student-list").html(''); 
    let query = e.target.value;
    $.get("http://api.bpnhs.org:3000/memberslike/" + query, (data) => { 
        data.forEach(student => {
            $("#student-list").append($('<option/>').text(student.name));
        });
    });
})

let timeFormat = 'MM/DD/YYYY';
let eventErrorMessage = $('#no-events-message');
let eventRowTemplate = $("#lookup-event-row").html();
let meetingErrorMessage = $("#no-meetings-message");
let meetingRowTemplate = $("#lookup-attendance-row").html();
$("#student-switch").click(e => { 
    $.get("http://api.bpnhs.org:3000/" + $("#student-lookup").val() + "/memberinfo", (data) => { 
        if(data.name) { 
            $("#lookup-username-text").text(data.name);
            $("#lookup-committee-text").text(data.committee);

            $.get("http://api.bpnhs.org:3000/" + data.name + "/memberhours", (data) => {
                $("#lookup-hours").empty();
                if(data.length == 0) $("#lookup-hours").append(eventErrorMessage);
                data.forEach(event => {
                    let eventRow = $(eventRowTemplate);
                    eventRow.find("#lookup-event-name").text(event.event_name);
                    eventRow.find("#lookup-event-date").text(moment(new Date(event.event_date)).format(timeFormat));
                    eventRow.find("#lookup-event-hours").text(event.hours);
                    let status = event.status == 0 ? "Pending" : event.status == 1 ? "Approved" : "Denied";
                    eventRow.find("#lookup-event-status").attr('class', `badge ${status}`).text(status);
                    $("#lookup-hours").append(eventRow);
                });
            });

            $.get("http://api.bpnhs.org:3000/" + data.name + "/memberattendance", (data) => {
                $("#lookup-attendance").empty();
                if(data.length == 0) $("#lookup-attendance").append(meetingErrorMessage);
                data.forEach(meeting => {
                    let meetingRow = $(meetingRowTemplate);
                    meetingRow.find("#lookup-meeting-name").text(meeting.meeting_name);
                    meetingRow.find("#lookup-meeting-date").text(moment(new Date(meeting.meeting_time)).format(timeFormat));
                    let status = meeting.attendance_status == 1 ? 'Present' : 'Absent';
                    meetingRow.find("#lookup-meeting-attendance").attr('class', `badge ${status}`).text(status);

                    $("#lookup-attendance").append(meetingRow);
                });
            });
        }
    });
})