$(document).ready(function() {
	forms_handler();
	links_handler();
	likes();
	dislikes();
	locks();
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

links_handler = function() {
    $(".link").click(function(e) {
        if (!$(e.target).hasClass('.link')) {
        var url =  $(this).attr("href");
        if (url != undefined) window.location = url;
        }
    });
}

forms_handler = function() 
{	
    $('<a class="expand button">'+$(".form").attr("title")+'</a>').insertBefore('.form');
	$(".form").hide("normal");
	
	$(".expand").live("click",function() {
		$(".form").show("normal");
		$(".expand").hide("normal");
		$(".form").wrap('<form action="" method="post" enctype="multipart/form-data">');
		$(".form").append('<br/><a class="submit button">Submit</a>');
		$("#register_link").hide("normal"); //костыль, но быстро
	});
	
	$(".submit").live("click",function() { 
		$(this).parent("div").parent("form").submit();
	});
	
	if ($(".form").attr("opened") == "true") $(".expand").click();
}

function likes() {
	$(".like").click(function(event) {
	    event.stopPropagation();
	    var elem = $(this);
	    elem.hide("normal");
		$.post("/japi/like", { id: $(this).attr('alt') } , function(data) {
		elem.show("normal")
		});
	});
}


function dislikes() {
	$(".dislike").click(function(event) {
	    event.stopPropagation();
	    var elem = $(this);
	    elem.hide("normal");
		$.post("/japi/dislike", { id: $(this).attr('alt') } , function(data) {
		elem.show("normal")
		});
	});
}

function locks() {
	$(".block").click(function(event) {
	    event.stopPropagation();
	    var elem = $(this);
	    elem.hide("normal");
		$.post("/japi/toogle_block", { id: $(this).attr('alt') } , function(data) {
		if (elem.text() == "Lock") { elem.text("Unlock"); elem.removeClass("reddy"); elem.addClass("greeny"); }
		else { elem.text("Lock"); elem.removeClass("greeny"); elem.addClass("reddy"); }
		elem.show("normal")
		});
	});
}


