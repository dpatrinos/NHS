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

})(jQuery);

