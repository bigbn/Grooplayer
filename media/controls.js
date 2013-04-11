$(document).ready(function() {
	forms_handler();
	links_handler();
	likes();
	dislikes();
	locks();
    prepare_slides();
    load_library();
    load_player();
    load_journal();
    load_profile();
    load_faq();
});

function load_player() {
    $("#tab_player").prepend('<div class="totals">Воспроизведение' +
        '<img class="right" src="/media/images/like.png"/>' +
        '<img class="right" src="/media/images/dislike.png"/>  ' +
        '<img class="right" src="/media/images/space.png"/>  ' +
        '<img class="right" src="/media/images/down.png"/>' +
        '<img class="right" src="/media/images/space.png"/>  ' +
        '<img class="right" src="/media/images/pause.png"/> ' +
        '<img class="right" src="/media/images/stop.png"/>' +
        '<img class="right" src="/media/images/play.png"/>' +
        '</div>');
    $(".song").click(function(){
        change_song($(this).attr("id"));
    });
}

function load_profile() {
    $.post("/japi/profile_info", {} , function(data) {
        var result = jQuery.parseJSON(data);
        if (!result.isAuthenticated) {
            $("#tab_profile").prepend('<div class="totals" id="not_logged">Вы не вошли. <div class="right"><a>Войти</a></div></div>');
            $("#login_form").show();
        }
        else {
            $("#login_form").hide();
            $("#not_logged").hide();
            setup_profile_info(result);
        }
    });
}

function setup_profile_info(data) {
    $("#tab_profile").prepend('<div class="totals">Вы вошли как '+data["username"]+'.<div class="right">Карма: '+data["carma"]+'</div></div>');
    var tracks = jQuery.parseJSON(data.tracks);
    $.each(tracks,function(index,item) {
        console.log(item);
        $("#tab_profile").append('<div class="song">'+item.fields.file+'' +
            '<div class="right"><span class="green">'+item.fields.likes+'</span>/<span class="red">'+item.fields.dislikes+'</span>&nbsp;' +
            '<img class="right" src="/media/images/lock'+item.fields.is_blocked+'.png"></div>' +
            '</div>');
    });
}

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
		$(".form").wrap('<form>');
		$(".form").append('<br/><a class="submit button">Submit</a>');
		$("#register_link").hide("normal"); //костыль, но быстро
	});
	
	$(".submit").live("click",function() { 
	    var inputs = $(this).parent("div").parent("form").find("input");

        var request = new Object();
        $.each(inputs,function(index,item) {
            request[$(item).attr("name")] = $(item).val();
        });

        var url = $(this).parent(".form").attr("url");
        console.log(url);
        var callback = $(this).parent(".form").attr("callback");
        console.log(callback);
        $.post(url, request, function(data) {
            window[callback](data);
        });
	});

	if ($(".form").attr("opened") == "true") $(".expand").click();
}

function prepare_slides() {
    var navigator = $("#navigator");
    var tabs = navigator.find(".tab");
    $.each(tabs,function(index,item) {
        $(item).click(function() {
            switch_tab(index);
        });
    });

    var slides = navigator.find(".slide");
    $.each(slides,function(index,item) {
        var margin = index * 60;
        $(item).css({"marginLeft": margin+"%" }); //, "marginTop": margin/10+"%"});
    });
    switch_tab(0);
}

function change_song(id) {
    $.post("/japi/change_track", {"id":id} , function(data) {
        var result = jQuery.parseJSON(data);
        if (result.isChanged)
            if (result.isChanged === true) {
                $("#"+id+".song").addClass("pending");
            }
    });
}

function switch_tab(index) {
    var navigator = $("#navigator");
    var slides = navigator.find(".slide");
    var tabs = navigator.find(".tab");
    var tab_index = index;

    $.each(slides,function(index,item) {
        var margin = index * 60 - tab_index * 60;
        console.log(margin);
        $(item).animate({"marginLeft": margin+"%" });//, marginTop: margin/10+"%"});
    });

    $(slides[index]).animate({opacity: 1}).css({"z-index": 0});
    $(tabs[index]).addClass("current_tab");
    slides.not(slides[index]).animate({opacity:.1}).css({"z-index":-1});
    tabs.not(tabs[index]).removeClass("current_tab");
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

function refresh() {
    $.post("/japi/is_track_changed", { id: current_song_id} , function(data) {
        var result = jQuery.parseJSON(data);
        if (result["isChanged"] == true) {
            refresh_info(result.newSong);
        }
    });
}

function htmlspecialchars(string) {
    return $('<span>').text(string).html();
}

function refresh_info(track){
    console.log(track);
    current_song_id = track.id;
    $("#artist").fadeOut("normal").html(htmlspecialchars(track.artist)).fadeIn("normal");
    $("#playing").fadeOut("normal").html(htmlspecialchars(track.title)).fadeIn("normal");
    $("#album").fadeOut("normal").html(htmlspecialchars(track.album)).fadeIn("normal");
    $("#filename").fadeOut("normal").html(htmlspecialchars(track.file)).fadeIn("normal");
    $(".current").removeClass("current");
    $(".song").removeClass("pending");
    $("#"+track.id).removeClass("pending").addClass("current");
    refresh_artist_info(track.artist);

    $('html, body').animate({
        scrollTop: $(".current").offset().top - 70}, 2000);
}

function refresh_artist_info(artist) {
    /* Load some artist info. */
    lastfm.artist.getInfo({artist: artist,lang:"ru"}, {success: function(data){
        $("#last_info").fadeOut("normal").html(data.artist.bio.content).fadeIn("normal");
        $("#track_image").fadeOut("normal").html("<img style='width: 100%; border-radius: 3px' src='"+data.artist.image[2]["#text"]+"'/>").fadeIn("normal");
        /* Use data. */
    }, error: function(code, message){
        /* Show error message. */
        console.log(error);
    }});
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

function load_library() {
    $.post("/japi/library", {} , function(data) {
        var result = jQuery.parseJSON(data);
        $.each(result,function(index,item) {
            $("#tab_library").append('<div class="song">'+item["file"]+'</div>');
        });
        $("#tab_library").prepend('<div class="totals">Всего в библиотеке '+ result.length +'</div>');
    });
}


function load_journal() {
    addPlaceHolder("#tab_journal","Временно недоступно");
 /*   $.post("/japi/journal", {} , function(data) {
         console.log(result)
        $.each(result,function(index,item) {
            $("#tab_journal").append('<div class="song">'+item["action"]+'</div>');
        });
        $("#tab_library").prepend('<div class="totals">Всего в библиотеке '+ result.length +'</div>');
    });*/
    $("#tab_journal").prepend('<div class="totals">История изменений</div>');
}

function load_faq() {
    addPlaceHolder("#tab_faq","Временно недоступно");
    $("#tab_faq").prepend('<div class="totals">Часто задаваемые вопросы</div>');

}

function addPlaceHolder(id,message) {
    $(id).append('<div class="placeholder">'+message+'</div>');

}

function loginCallback(data) {
    var result = jQuery.parseJSON(data);
    if (result.Status) {
        load_profile();
    } else ShowError("Неправильные данные. Войти не получается.");
}

function ShowError(msg) {
    var modal = "<div class='modal'>"+msg+"</div>";
    $("html").append(modal);
<<<<<<< HEAD

    setTimeout(function() {
        $(".modal").fadeOut("slow",function() {
            $("html").remove(".modal");
        });
    }, 3000);
}

setTimeout(function() {ShowError("Убедительная просьба. Не рассказывайте никому про радио, пока не будет отмашки!<br/> Спасибо!");},3000);
=======

    setTimeout(function() {
        $(".modal").fadeOut("slow",function() {
            $("html").remove(".modal");
        });
    }, 2000);
}
>>>>>>> bd2fab358dbaa2d03656137ccd87def80e3e313d
