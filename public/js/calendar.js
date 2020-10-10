$(document).ready(function() {
  var calendarEl = document.getElementById('calendar');
  
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [
      {
        title: 'First Day of School',
        start: '2020-09-01'
      },
      {
        title: 'No School',
        start: '2020-09-07'
      },
      {
        title: '2 Hour Delay',
        start: '2020-09-22'
      },
      {
        title: '2 Hour Delay',
        start: '2020-10-01'
      },
      {
        title: 'No School',
        start: '2020-10-02'
      },
      {
        title: 'No School',
        start: '2020-11-03'
      },
      {
        title: 'No School',
        start: '2020-11-06'
      },
      {
        title: 'No School',
        start: '2020-11-26',
        end: '2020-11-28'
      },
      {
        title:'No School',
        start: '2020-11-30'
      },
      {
        title: '2 Hour Delay',
        start: '2020-12-10'
      },
      {
        title: 'No School',
        start: '2020-12-24',
        end: '2020-12-26'
      },
      {
        title: 'No School',
        start: '2020-12-28',
        end: '2021-01-02'
      },
      {
        title: 'No School',
        start: '2021-01-18'
      },
      {
        title: '2 Hour Delay',
        start: '2021-01-26'
      },
      {
        title: 'No School',
        start: '2021-01-29'
      },
      {
        title: 'No School',
        start: '2021-02-15'
      },
      {
        title: '2 Hour Delay',
        start: '2021-03-30'
      },
      {
        title: 'No School',
        start: '2021-04-01',
        end: '2021-04-03'
      },
      {
        title: 'No School',
        start: '2021-04-05',
        end: '2021-04-06'
      },
      {
        title: 'No School',
        start: '2021-05-18'
      },
      {
        title: 'No School',
        start: '2021-05-31'
      },
      {
        title: 'Last Day of School',
        start: '2021-06-11'
      },
    ]
  });
  calendar.render();
});