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
      }

      else if (email=="" || confirmEmail=="") {
        $("#set-email").css("border", "1px solid transparent");
        $('#set-email2').css('border', '1px solid transparent');
      }

      else {
        $('#set-email').css('border', '2px solid green');
        $('#set-email2').css('border', '2px solid green');
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
      }
      
      else if ((password=="") || (confirmPassword=="")) {
        $("#set-pw").css("border", "1px solid transparent");
        $('#set-pw2').css('border', '1px solid transparent');
      }

      else {
        $('#set-pw').css('border', '2px solid green');
        $('#set-pw2').css('border', '2px solid green');
      }
    }

})(jQuery);

