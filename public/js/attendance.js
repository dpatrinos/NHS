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
});

const attendanceRowTemplate = $("#attendance-row").html();
//get attendance info
const updateAttendanceInfo = () => { 
    let params = new URLSearchParams(location.search);
    $.get("http://api.bpnhs.org:3000/meetings/" + params.get("meetingtime").replaceAll("/", "%2F") + "/" + params.get("meetingname") + "/attendance", (data) => { 
        console.log(data);
        $("#attendance-body").empty();
        data.forEach(member => { 
            let attendanceRow = $(attendanceRowTemplate);
            attendanceRow.find("#member-name").text(member.name);
            attendanceRow.find("#member-committee").text(member.committee);
            let checkedIndex = member.attendance_status ? 0 : 1;
            console.log(attendanceRow.find("#member-attendance")[checkedIndex]);
            attendanceRow.find("#member-attendance").attr("name", member.name);
            attendanceRow.find("#member-attendance")[checkedIndex].checked = true;
            $("#attendance-body").append(attendanceRow);
        });
    });
}

setInterval(updateAttendanceInfo, 1000);