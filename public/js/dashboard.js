let timeFormat = 'MM/DD/YYYY';

//Get User info
$.ajax({
  type: 'get',
  url: 'http://api.bpnhs.org/currentUser',
  crossDomain: true,
  xhrFields: {
      withCredentials: true
  },
  success: (data) => {
    if(data.name) {
      $("#username-text").text(data.name);
      $("#committee-text").text(data.committee == "NONE" ? "No Committee Designated" : data.committee + " Committee");
      if(data.status == "chair") chairUpdate(data.committee);
      else if (data.status == "officer") officerUpdate();
      else {$("#admin").remove();}
    } else {
      location.href = "/login";
    }
  }
})

//Get user events
let eventData = [];
$.ajax({
  type: 'get',
  url: 'http://api.bpnhs.org/currentUser/pastevents',
  crossDomain: true,
  xhrFields: {
      withCredentials: true
  },
  success: (data) => {
    if(data.length != 0) { 
      $("#no-events-message").hide();
      let totalEventHours = 0;
      for(let event of data) {
        let eventRow = $($("#event-row").html());

        eventRow.find('#event-name').text(event.event_name);

        totalEventHours += event.hours;

        let date = moment(new Date(event.event_date)).format(timeFormat);
        console.log(date)
        eventData.push({x: date, y: totalEventHours, name: event.event_name});
        eventRow.find('#event-date').text(date);
        eventRow.find('#event-hours').text(event.hours.toFixed(1));

        let status = event.status == 0 ? "Pending" : event.status == 1 ? "Approved" : "Denied";
        eventRow.find('#event-status').attr("class", `badge ${status}`).text(status);

        $("#hours").append(eventRow);
      }      
      
      hoursGraph.data.datasets[0].data = eventData;
      hoursGraph.update();
    }

  }
})

//get user attendance
let attendanceData = [];
$.ajax({
  type: 'get',
  url: 'http://api.bpnhs.org/currentUser/attendance',
  crossDomain: true,
  xhrFields: {
      withCredentials: true
  },
  success: (data) => {
    if(data.length != 0) {
      $("#no-meetings-message").hide();
      for(meeting of data) { 
        attendanceData.push(meeting.attendance_status);
        let attendanceRow = $($("#attendance-row").html());

        attendanceRow.find("#meeting-name").text(meeting.meeting_name);

        let date = moment(new Date(meeting.meeting_time)).format(timeFormat);
        attendanceRow.find("#meeting-date").text(date);

        let status = meeting.attendance_status == 0 ? "Absent" : "Present";
        attendanceRow.find("#meeting-attendance").attr("class", `badge ${status}`).text(status);

        $("#attendance").append(attendanceRow);
      }
      let absentCount = attendanceData.filter(x => x === 0).length;
      let presentCount = attendanceData.filter(x => x === 1).length;

      attendancePercentage = Math.round(presentCount / data.length * 100)  + "%";

      attendanceDoughnut.data.datasets[0].data = [presentCount, absentCount];
      attendanceDoughnut.options.elements.center.text = attendancePercentage;
      attendanceDoughnut.update();

    }
  }
})

function chairUpdate(committee) { 
  fetchCommitteeAttendance(committee, (chartData) => { 
    let committeeAttendanceTemplate = $("#comittee-attendance-row").html();
    $("#committee-attendance-text").text(committee + " Committee Attendance")

    chartData.forEach((row) => {
      let comAttRow = $(committeeAttendanceTemplate);
      comAttRow.find("#comittee-attendance-row-name").text(row.name);
      comAttRow.find("#comittee-attendance-row-percent").text(row.percent + "%");
      $("#committee-attendance").append(comAttRow);
    });

    $("#committee-attendance-search").keyup((e) =>  {
      let committeeSearchResults = chartData.filter(x => x.name.toLowerCase().includes(e.target.value.toLowerCase()));
      $("#committee-attendance").html('');
      committeeSearchResults.forEach((row) => {
        let comAttRow = $(committeeAttendanceTemplate);
        comAttRow.find("#comittee-attendance-row-name").text(row.name);
        comAttRow.find("#comittee-attendance-row-percent").text(row.percent + "%");
        $("#committee-attendance").append(comAttRow);
      });
    });
  }, (graphData) => {
    committeeChart.data.datasets[0].data = graphData;
    committeeChart.data.datasets[0].label = "Percent of " + committee + " Members in Attendance";
    committeeChart.update();
  });
  
}

function officerUpdate() { 
  let committees = ['Community Service', 'PR and Fundraising', 'Dance and Induction'];
  let colors = ['0, 0, 255', '0, 255, 0', '255, 0, 0'];
  let selectedCommittee = 0;
  let committeeAttendanceByMember = [];
  
  committeeChart.data.datasets = [];

  committees.forEach(committee => {
    let index = committees.indexOf(committee);
    fetchCommitteeAttendance(committee, (chartData) => {
      let committeeAttendanceTemplate = $("#comittee-attendance-row").html();
      committeeAttendanceByMember.push(chartData);
      
      if(index == committees.length - 1) {
        function updateTable(clear=true) {
          if(clear) $("#committee-attendance").html('');
          committeeAttendanceByMember[selectedCommittee].forEach((row) => {
            let comAttRow = $(committeeAttendanceTemplate);
            comAttRow.find("#comittee-attendance-row-name").text(row.name);
            comAttRow.find("#comittee-attendance-row-percent").text(row.percent + "%");
            $("#committee-attendance").append(comAttRow);
          });
        }

        function updateTableAll() {
          $("#committee-attendance").html('');
          committees.forEach(committee => {
            selectedCommittee = committees.indexOf(committee);
            updateTable(false);
          });

          selectedCommittee = null;
        }

        console.log(committeeAttendanceByMember);
        updateTable();
        
        $("#committee-attendance-search").keyup((e) =>  {
          $("#committee-attendance").html('');
          function searchCommittee(scommittee) {
            let committeeSearchResults = committeeAttendanceByMember[scommittee].filter(x => x.name.toLowerCase().includes(e.target.value.toLowerCase()));
            committeeSearchResults.forEach((row) => {
              let comAttRow = $(committeeAttendanceTemplate);
              comAttRow.find("#comittee-attendance-row-name").text(row.name);
              comAttRow.find("#comittee-attendance-row-percent").text(row.percent + "%");
              $("#committee-attendance").append(comAttRow);
            });
          }

          selectedCommittee != null ? searchCommittee(selectedCommittee) : committees.forEach(x => searchCommittee(committees.indexOf(x)));
        });

        $('#dia').click(() => {selectedCommittee = 2; updateTable();});
        $('#csa').click(() => {selectedCommittee = 0; updateTable();});
        $('#prfa').click(() =>  {selectedCommittee = 1; updateTable();});
        $('#alla').click(() => {updateTableAll()});
      }
    }, (graphData) => {
      committeeChart.data.datasets.push({label: "Percent of " + committee + " Members in Attendance", borderColor: "rgb(" + colors[index] + ")", backgroundColor: 'rgba(' + colors[index] + ', .4)', data: graphData});
      committeeChart.update();
    });
  });
}

//Sets up commitee attendance data
function fetchCommitteeAttendance(committee, chartcb, graphcb) { 
  let committeeAttendanceByMember = [];
  let committeeAttendanceByEvent = [];
  let url = "http://api.bpnhs.org:3000/" + committee;
  console.log(url);
  $.get(url + "/committeeattendance", (attendance) => {

    //sort committee attendance by member and set up table
    $.get(url + "/committeemembers", (members) => {
      members.forEach(member => {
        let memberAttendance = attendance.filter(x => x.name === member.name);
        let memberAttendancePercentage = Math.round((memberAttendance.filter(x => x.attendance_status === 1).length / memberAttendance.length) * 100);
        committeeAttendanceByMember.push({name : member.name, percent : memberAttendancePercentage});
      });

      chartcb(committeeAttendanceByMember);
      
    });

    //sort committee attendance by event
    $.get(url + "/committeemeetings", (meetings) => {
      meetings.forEach(meeting => {
        let meetingAttendance = attendance.filter(x => x.meeting_time == meeting.meeting_time);
        let meetingAttendancePercentage = meetingAttendance.filter(x => x.attendance_status === 1).length / meetingAttendance.length * 100;
        committeeAttendanceByEvent.push({meetingname : meeting.name, x: moment(new Date(meeting.meeting_time)).format(timeFormat), y : meetingAttendancePercentage});
      });

      graphcb(committeeAttendanceByEvent);
      
    });
  });
}



// HOURS CHART
var hoursGraph;
var ctx = document.getElementById('hoursGraph').getContext('2d');
var options = {
  title: {
      display: true,
      fontSize: 14,
      fontFamily: 'sans-serif',
      fontColor: '#495057',
      text: 'Hours Goal Chart'
  },
  layout: {
      padding: {
          left: 15,
          right: 15,
          top: 15,
          bottom: 20
      }
  },
  scales: {
    xAxes: [{
        type: 'time',
        time: {
          unit: 'month'
        }
    }],
    yAxes: [{
      ticks: {
        max: 6,
        min: 0
      }
    }]
  } 
}

hoursGraph = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: 
    [
      {
        label: "Hours accumulated",
        borderColor: "#fca474",
        backgroundColor: 'rgba(252, 164, 116, .4)',
        data: []
      },
    ]
  },
  options: options
})




//ATTENDANCE CHART
var ctx2 = document.getElementById('attendanceDoughnut').getContext('2d');
var attendancePercentage = '100%'  //REQUIRES FUNCTION TO BE UPDATED FROM DATABASE

var options2 = {
  cutoutPercentage: 88,
  title: {
      display: true,
      fontSize: 14,
      fontFamily: 'sans-serif',
      fontColor: '#495057',
      text: 'Your Attendance Breakdown'
  },
  layout: {
      padding: {
          left: 0,
          right: 0,
          top: 15,
          bottom: 20
      }
  },
  elements: {
    center: {
      text: attendancePercentage,
      color: '#fca474', 
      fontStyle: 'sans-serif', 
      sidePadding: 20, 
      minFontSize: 25, 
      lineHeight: 25 
    }
  },
  legend: {
    display: false
  }
}


var data2 = {
    datasets: [{
        data: [1,0],  //REQUIRES FUNCTION TO BE UPDATED FROM DATABASE
        backgroundColor: ['#f56b2c','transparent'],
        borderColor: ['transparent', 'transparent']
    }],
    labels: [
        ' Meetings Present', 'Meetings Absent'
    ],
}
var attendanceDoughnut = new Chart(ctx2, {
    type: 'doughnut',
    data: data2,
    options: options2
})

// COMMITTEE CHAIR ATTENDANCE CHART
var committeeChart;
var ctx3 = document.getElementById('committee-attendance-chart').getContext('2d');
var options3 = {
  layout: {
      padding: {
          left: 15,
          right: 15,
          top: 15,
          bottom: 20
      }
  },
  scales: {
    xAxes: [{
        type: 'time',
        time: {
          unit: 'month'
        }
    }],
    yAxes: [{
      ticks: {
        max: 100,
        min: 0
      }
    }]
  } 
}

committeeChart = new Chart(ctx3, {
  type: 'line',
  data: {
    datasets: 
    [
      {
        label: "Percent of Community Service Members in Attendance",
        borderColor: "#fca474",
        backgroundColor: 'rgba(252, 164, 116, .4)',
        data: []
      },
    ]
  },
  options: options3
})

Chart.pluginService.register({
  beforeDraw: function(chart) {
    if (chart.config.options.elements.center) {
      var ctx = chart.chart.ctx;

      var centerConfig = chart.config.options.elements.center;
      var fontStyle = centerConfig.fontStyle || 'Arial';
      var txt = centerConfig.text;
      var color = centerConfig.color || '#000';
      var maxFontSize = centerConfig.maxFontSize || 75;
      var sidePadding = centerConfig.sidePadding || 20;
      var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
      
      ctx.font = "30px " + fontStyle;

      var stringWidth = ctx.measureText(txt).width;
      var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

      var widthRatio = elementWidth / stringWidth;
      var newFontSize = Math.floor(30 * widthRatio);
      var elementHeight = (chart.innerRadius * 2);

      var fontSizeToUse = Math.min(newFontSize, elementHeight, maxFontSize);
      var minFontSize = centerConfig.minFontSize;
      var lineHeight = centerConfig.lineHeight || 25;
      var wrapText = false;

      if (minFontSize === undefined) {
        minFontSize = 20;
      }

      if (minFontSize && fontSizeToUse < minFontSize) {
        fontSizeToUse = minFontSize;
        wrapText = true;
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
      var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
      ctx.font = fontSizeToUse + "px " + fontStyle;
      ctx.fillStyle = color;

      if (!wrapText) {
        ctx.fillText(txt, centerX, centerY);
        return;
      }

      var words = txt.split(' ');
      var line = '';
      var lines = [];


      centerY -= (lines.length / 2) * lineHeight;

      for (var n = 0; n < lines.length; n++) {
        ctx.fillText(lines[n], centerX, centerY);
        centerY += lineHeight;
      }
      ctx.fillText(line, centerX, centerY);
    }
  }
});


(function ($) {
  "use strict";
    
    $(document).ready(function() {
      $('#csa').click(function() {
        $('#current-com').text('Community Service Committee Attendance ');
        $('<span class="caret"></span>').appendTo('#current-com')
        $('#csa').hide();
        $('#dia').show();
        $('#prfa').show();
        $('#alla').show();
      });
      $('#dia').click(function() {
        $('#current-com').text('Dance and Induction Committee Attendance ');
        $('<span class="caret"></span>').appendTo('#current-com')
        $('#dia').hide();
        $('#csa').show();
        $('#prfa').show();
        $('#alla').show();
      });
      $('#prfa').click(function() {
        $('#current-com').text('PR and Fundraising Committee Attendance ');
        $('<span class="caret"></span>').appendTo('#current-com')
        $('#prfa').hide();
        $('#csa').show();
        $('#dia').show();
        $('#alla').show();
      });
      $('#alla').click(function() {
        $('#current-com').text('All Members Attendance ');
        $('<span class="caret"></span>').appendTo('#current-com')
        $('#alla').hide();
        $('#csa').show();
        $('#dia').show();
        $('#prfa').show();
      });
    });
    
})(jQuery);