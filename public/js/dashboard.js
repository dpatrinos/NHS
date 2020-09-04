//Get User info
$.ajax({
  type: 'get',
  url: 'http://api.example.com/currentUser',
  crossDomain: true,
  xhrFields: {
      withCredentials: true
  },
  success: (data) => {
    if(data.name) {
      console.log(data)
      $("#username-text").text(data.name);
    } else {
      location.href = "/login";
    }
  }
})

//Get user events
$.ajax({
  type: 'get',
  url: 'http://api.example.com/currentUser/pastevents',
  crossDomain: true,
  xhrFields: {
      withCredentials: true
  },
  success: (data) => {
    if(data.length != 0) { 
      console.log(data)
      $("#no-events-message").hide();
      for(let event of data) {
        let eventRow = $($("#event-row").html());
        eventRow.find('#event-name').text(event.event_name);
        console.log(event.event_date)
        let date = new Date(event.event_date);
        eventRow.find('#event-date').text(date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear());
        eventRow.find('#event-hours').text(event.hours.toFixed(1));
        let status = event.status == 0 ? "Pending" : event.status == 1 ? "Approved" : "Denied";
        eventRow.find('#event-status').attr("class", `badge ${status}`).text(status);
        $("#hours").append(eventRow);
      }
      
    }

  }
})

// HOURS CHART
var ctx = document.getElementById('hoursDoughnut').getContext('2d');
var options = {
    title: {
        display: true,
        fontSize: 14,
        fontFamily: 'sans-serif',
        fontColor: '#495057',
        text: 'Progress of Other Students'
    },
    layout: {
        padding: {
            left: 0,
            right: 0,
            top: 15,
            bottom: 20
        }
    },
}
var data = {
    datasets: [{
        data: [14, 66, 97], //REQUIRES FUNCTION TO BE UPDATED FROM DATABASE
        backgroundColor: ['#f37032','#fca474','#f3b797']
    }],
    labels: [
        ' 6+ NHS Hours',
        ' 3-6 NHS Hours',
        ' 0-3 NHS Hours'
    ],
}
var hoursDoughnut = new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: options
})

//ATTENDANCE CHART
var ctx2 = document.getElementById('attendanceDoughnut').getContext('2d');
var attendancePercentage = '90%'  //REQUIRES FUNCTION TO BE UPDATED FROM DATABASE

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
        data: [8,4],  //REQUIRES FUNCTION TO BE UPDATED FROM DATABASE
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
