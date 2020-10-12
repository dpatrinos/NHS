const dotenv = require("dotenv").config();
const port = process.env.PORT;
const apiPath = 'http://api.bpnhs.org:' + port;

setInterval (() => {$.ajax({
    type: 'get',
    url: apiPath + '/currentUser',
    crossDomain: true,
    xhrFields: {
        withCredentials: true
    },
    success: (data) => {
      if(!data.name) {
        location.href = '/login';
      } 
    }
})}, 5000);

const attendanceRowTemplate = $("#attendance-row").html();
//get attendance info
const updateAttendanceInfo = () => { 
    let params = new URLSearchParams(location.search);
    $.get(apiPath + "/meetings/" + params.get("meetingtime").replaceAll("/", "%2F") + "/" + params.get("meetingname") + "/attendance", (data) => { 
        $("#attendance-body").show();
        $("#table-spinner").hide();
        $("#attendance-body").empty();
        data.forEach(member => { 
            let attendanceRow = $(attendanceRowTemplate);
            attendanceRow.find("#member-name").text(member.name);
            attendanceRow.find("#member-committee").text(member.committee);
            let checkedIndex = member.attendance_status ? 0 : 1;
            attendanceRow.find("#member-attendance").attr("name", member.name);
            attendanceRow.find("#member-attendance")[checkedIndex].checked = true;
            attendanceRow.find("#member-attendance").change((e) => { 
                clearInterval(updateInt);
                $.get(apiPath + "/meetings/" + params.get("meetingtime").replaceAll("/", "%2F") + "/" + params.get("meetingname") + "/attendance/updatemember/" + e.target.name + "/" + e.target.value, (data) => { 
                    console.log(data)
                    updateInt = setInterval(updateAttendanceInfo, 1000);
                });
            });
            $("#attendance-body").append(attendanceRow);
        });
    });
}

$("#attendance-body").hide();
let updateInt = setInterval(updateAttendanceInfo, 1000);