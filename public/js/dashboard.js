let timeFormat = 'MM/DD/YYYY';

//Get User info
$.ajax({
  type: 'get',
  url: 'http://api.bpnhs.org:3000/currentUser',
  crossDomain: true,
  xhrFields: {
      withCredentials: true
  },
  success: (data) => {
    if(data.name) {
      $("#username-text").text(data.name);
      $("#committee-text").text(data.committee == "NONE" ? "No Committee Designated" : data.committee + " Committee");
    } else {
      location.href = "/login";
    }
  }
})

//Get user events
let eventData = [];
$.ajax({
  type: 'get',
  url: 'http://api.bpnhs.org:3000/currentUser/pastevents',
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
  url: 'http://api.bpnhs.org:3000/currentUser/attendance',
  crossDomain: true,
  xhrFields: {
      withCredentials: true
  },
  success: (data) => {
    console.log(data)
    if(data.length != 0) {
      $("#no-meetings-message").hide();
      for(meeting of data) { 
        attendanceData.push(meeting.status);
        let attendanceRow = $($("#attendance-row").html());

        attendanceRow.find("#meeting-name").text(meeting.meeting_name);

        let date = moment(new Date(meeting.meeting_time)).format(timeFormat);
        attendanceRow.find("#meeting-date").text(date);

        let status = meeting.status == 0 ? "Absent" : "Present";
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
        max: 6,
        min: 0
      }
    }]
  } 
}

hoursGraph = new Chart(ctx3, {
  type: 'line',
  data: {
    datasets: 
    [
      {
        label: "Community Service Members in Attendance",
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

    //TABLE PAGINATION
    $.fn.pageMe = function(opts){
      var $this = this,
          defaults = {
              perPage: 7,
              showPrevNext: false,
              hidePageNumbers: false
          },
          settings = $.extend(defaults, opts);
      
      var listElement = $this;
      var perPage = settings.perPage; 
      var children = listElement.children();
      var pager = $('.pager');
      
      if (typeof settings.childSelector!="undefined") {
          children = listElement.find(settings.childSelector);
      }
      
      if (typeof settings.pagerSelector!="undefined") {
          pager = $(settings.pagerSelector);
      }
      
      var numItems = children.size();
      var numPages = Math.ceil(numItems/perPage);

      pager.data("curr",0);
      
      if (settings.showPrevNext){
          $('<li><a href="#" class="prev_link">Previous</a></li>').appendTo(pager);
      }
      
      var curr = 0;
      while(numPages > curr && (settings.hidePageNumbers==false)){
          $('<li><a href="#" class="page_link">'+(curr+1)+'</a></li>').appendTo(pager);
          curr++;
      }
      
      if (settings.showPrevNext){
          $('<li><a href="#" class="next_link">Next</a></li>').appendTo(pager);
      }
      
      pager.find('.page_link:first').addClass('active');
      pager.find('.prev_link').hide();
      if (numPages<=1) {
          pager.find('.next_link').hide();
      }
      pager.children().eq(1).addClass("active");
      
      children.hide();
      children.slice(0, perPage).show();
      
      pager.find('li .page_link').click(function(){
          var clickedPage = $(this).html().valueOf()-1;
          goTo(clickedPage,perPage);
          return false;
      });
      pager.find('li .prev_link').click(function(){
          previous();
          return false;
      });
      pager.find('li .next_link').click(function(){
          next();
          return false;
      });
      
      function previous(){
          var goToPage = parseInt(pager.data("curr")) - 1;
          goTo(goToPage);
      }
      
      function next(){
          var goToPage = parseInt(pager.data("curr")) + 1;
          goTo(goToPage);
      }
      
      function goTo(page){
          var startAt = page * perPage,
              endOn = startAt + perPage;
          
          children.css('display','none').slice(startAt, endOn).show();
          
          if (page>=1) {
              pager.find('.prev_link').show();
          }
          else {
              pager.find('.prev_link').hide();
          }
          
          if (page<(numPages-1)) {
              pager.find('.next_link').show();
          }
          else {
              pager.find('.next_link').hide();
          }
          
          pager.data("curr",page);
          pager.children().removeClass("active");
          pager.children().eq(page+1).addClass("active");
      
      }
    };

    $(document).ready(function(){
      $('#hours').pageMe({pagerSelector:'#hours-pager',showPrevNext:true,hidePageNumbers:false,perPage:4});
    });

    $(document).ready(function(){
      $('#attendance').pageMe({pagerSelector:'#attendance-pager',showPrevNext:true,hidePageNumbers:false,perPage:4});
    });

    $(document).ready(function(){
      $('#committee-attendance').pageMe({pagerSelector:'#committee-attendance-pager',showPrevNext:true,hidePageNumbers:false,perPage:4});
    });

    $(document).ready(function() {
      $('#csa').click(function() {
        $('#current-com').text('Community Service Committee Attendance ');
        $('<span class="caret"></span>').appendTo('#current-com')
        $('#csa').hide();
        $('#dia').show();
        $('#prfa').show();
      });
      $('#dia').click(function() {
        $('#current-com').text('Dance and Induction Committee Attendance ');
        $('<span class="caret"></span>').appendTo('#current-com')
        $('#dia').hide();
        $('#csa').show();
        $('#prfa').show();
      });
      $('#prfa').click(function() {
        $('#current-com').text('PR and Fundraising Committee Attendance ');
        $('<span class="caret"></span>').appendTo('#current-com')
        $('#prfa').hide();
        $('#csa').show();
        $('#dia').show();
      });
    });

    $(document).ready(function() {
      $('.committee-drop').hover(function() {
        $('#current-com').css('color','#f56b2c');
      });
    });

    //$(document).ready(function)

})(jQuery);