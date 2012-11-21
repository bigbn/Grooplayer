$(document).ready(function() {
	forms_handler();
});

$(function() {
  var slider  = jQuery( '#slider' ),
      tooltip = jQuery( '.tooltip' );
  tooltip.hide();
  slider.slider({
    range: "min",
    min: 1,
    value: 35,
    start: function( event,ui ) {
      tooltip.fadeIn( 'fast' );
    },
    slide: function( event, ui ) {
      var value  = slider.slider('value'),
          volume = jQuery('.volume');
      tooltip.css( 'left', value ).text( ui.value );
      if ( value <= 5 ) {
        volume.css( 'background-position', '0 0' );
      }
      else if ( value <= 25 ) {
        volume.css( 'background-position', '0 -25px' );
      }
      else if ( value <= 75 ) {
        volume.css( 'background-position', '0 -50px' );
      } else {
        volume.css( 'background-position', '0 -75px' );
      };
    },
    stop: function( event,ui ) {
      tooltip.fadeOut( 'fast' );
    }
    ,
    change: function(event,ui) {
    	$.post("/japi/volume", { value: slider.slider('value') } );
    }
    
  });
});


forms_handler = function() 
{	
    $('<a class="expand button">'+$(".form").attr("title")+'</a>').insertBefore('.form');
	$(".form").hide("normal");
	
	$(".expand").live("click",function() {
		$(".form").show("normal");
		$(".expand").hide("normal");
		$(".form").wrap('<form action="" method="post">');
		$(".form").append('<br/><a class="submit button">Submit</a>');
		$("#register_link").hide("normal"); //костыль, но быстро
	});
	
	$(".submit").live("click",function() { 
		$(this).parent("div").parent("form").submit();
	});
	
	if ($(".form").attr("opened") == "true") $(".expand").click();
}