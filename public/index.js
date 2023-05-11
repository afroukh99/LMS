var myButton = document.getElementById("collapse");
var myIcon = myButton.querySelector("i");

myButton.addEventListener("click", function() {
  if (myIcon.classList.contains("fa-angle-right")) {
    myIcon.classList.remove("fa-angle-right");
    myIcon.classList.add("fa-angle-down");
  } else {
    myIcon.classList.remove("fa-angle-down");
    myIcon.classList.add("fa-angle-right");
  }
});



import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';

document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');
  var calendar = new Calendar(calendarEl, {
    plugins: [ dayGridPlugin, bootstrapPlugin ],
    themeSystem: 'bootstrap',
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [
      // Add your events here
    ]
  });
  calendar.render();
});
