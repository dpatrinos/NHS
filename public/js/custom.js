(function ($) {

  "use strict";

    // PRE LOADER
    $(window).load(function(){
      $('.preloader').fadeOut(1000); // set duration in brackets    
    });


    // MENU
    $('.navbar-collapse a').on('click',function(){
      $(".navbar-collapse").collapse('hide');
    });

    $(window).scroll(function() {
      if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
          } else {
            $(".navbar-fixed-top").removeClass("top-nav-collapse");
          }
    });

    if($(window).width()<768) {
      $('#right-menu').hide();
      $('#right-menu-collapse').show();
    }
    else {
      $('#right-menu').show();
      $('#right-menu-collapse').hide();
    }

    $(window).on('resize', function() {
      if($(window).width()<768) {
        $('#right-menu').hide();
        $('#right-menu-collapse').show();
      }
      else {
        $('#right-menu').show();
        $('#right-menu-collapse').hide();
      }
    });


    // HOME SLIDER & COURSES & CLIENTS
    $('.home-slider').owlCarousel({
      animateOut: 'fadeOut',
      items:1,
      loop:true,
      dots:false,
      autoplayHoverPause: false,
      autoplay: true,
      smartSpeed: 1000,
    })

    $('.owl-courses').owlCarousel({
      animateOut: 'fadeOut',
      loop: true,
      autoplayHoverPause: false,
      autoplay: true,
      smartSpeed: 1000,
      dots: false,
      nav:true,
      navText: [
          '<i class="fas fa-angle-left"></i>',
          '<i class="fas fa-angle-right"></i>'
      ],
      responsiveClass: true,
      responsive: {
        0: {
          items: 2,
        },
        1000: {
          items: 3,
        }
      }
    });


    // SMOOTHSCROLL
    $(function() {
      $('.custom-navbar a, #home a').on('click', function(event) {
        var $anchor = $(this);
          $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - 49
          }, 1000);
            event.preventDefault();
      });
    });

    // ENTER TO SUBMIT
    $(document).ready(function() {
      $('input').keyup(function(event) {
        if (event.which === 13) {
          event.preventDefault();
          $('form').submit();
        }
      });
    });

    $('form').attr('autocomplete','false');

    // EMAIL MATCHING
    $(document).ready(function () {
      $("#set-email, #set-email2").keyup(checkEmailMatch);
    });

    function checkEmailMatch() {
      var email = $("#set-email").val();
      var confirmEmail = $("#set-email2").val();
  
      if ((email!=confirmEmail) && (email!="") && (confirmEmail!="")) {
        $("#set-email").css("border", "2px solid red");
        $('#set-email2').css('border', '2px solid red');
        $('#create-button').prop('disabled', true);
      }

      else {
        $("#set-email").css("border", "1px solid transparent");
        $('#set-email2').css('border', '1px solid transparent');
        $('#create-button').prop('disabled', false);
      }
    }

    // PASSWORD MATCHING
    $(document).ready(function () {
      $("#set-pw, #set-pw2").keyup(checkPasswordMatch);
    });
    
    function checkPasswordMatch() {
      var password = $("#set-pw").val();
      var confirmPassword = $("#set-pw2").val();
  
      if ((password!=confirmPassword) && (password!="") && (confirmPassword!="")) {
        $("#set-pw").css("border", "2px solid red");
        $('#set-pw2').css('border', '2px solid red');
        $('#create-button').prop('disabled', true);
      }
      
      else {
        $("#set-pw").css("border", "1px solid transparent");
        $('#set-pw2').css('border', '1px solid transparent');
        $('#create-button').prop('disabled', false);
      }
    }

    // PASSWORD VALIDATION
    $(document).ready(function() {
      $('#set-pw').keyup(function() {
        var pswd = $(this).val();
        if ( pswd.length > 8 ) {
          $('#length i').removeClass('fa-times').addClass('fa-check');
          $('#length').css('color', 'green');
        }
        else {
          $('#length i').removeClass('fa-check').addClass('fa-times');
          $('#length').css('color', 'red'); 
        }
        if ( pswd.match(/[a-z]/) ) {
          $('#letter i').removeClass('fa-times').addClass('fa-check');
          $('#letter').css('color', 'green');
        }
        else {
          $('#letter i').removeClass('fa-check').addClass('fa-times');
          $('#letter').css('color', 'red');
        }
        if ( pswd.match(/[A-Z]/) ) {
          $('#capital i').removeClass('fa-times').addClass('fa-check');
          $('#capital').css('color', 'green');
        }
        else {
          $('#capital i').removeClass('fa-check').addClass('fa-times');
          $('#capital').css('color', 'red');
        }
        if ( pswd.match(/\d/) ) {
          $('#number i').removeClass('fa-times').addClass('fa-check');
          $('#number').css('color', 'green');
        }
        else {
          $('#number i').removeClass('fa-check').addClass('fa-times');
          $('#number').css('color', 'red');
        }
      }).focus(function() {
        $('.pw-info').show();
      }).blur(function() {
        $('.pw-info').hide();
      });
    });
    
})(jQuery);

document.addEventListener('DOMContentLoaded', function() {
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

