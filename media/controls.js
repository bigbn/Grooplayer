$(document).ready(function() {
	likes();
	dislikes();
	locks();
    prepare_slides();
    load_library();
    load_player();
    load_journal();
    load_profile();
    load_faq();


    links_handler();
    forms_handler();

    client_reload();
});

function load_player() {
    $("#tab_player").prepend('<div class="totals">Воспроизведение' +
        '<img id="client_status" class="left" src="/media/images/'+current_song_state+'ing.gif" style="height: 24px"/>' +
        '<img class="right rate" alt="like" src="/media/images/like.png"/>' +
        '<img class="right rate" alt="dislike" src="/media/images/dislike.png"/>  ' +
        '<img class="right" src="/media/images/space.png"/>  ' +
        '<img id="download_link" class="right link" href="/media/music/'+current_song_file+'" src="/media/images/down.png"/>' +
        '<img class="right link" href="/media/grooplayer.asx" src="/media/images/mediaplayer.png"/>' +
        '<img class="right link" href="/media/grooplayer.pls" src="/media/images/winamp.png"/>' +
        '<img class="right" src="/media/images/space.png"/>  ' +
        '<img id="client_pause" alt="pause" class="control right" src="/media/images/pause.png"/> ' +
        '<img id="client_stop" alt="stop" class="control right" src="/media/images/stop.png"/>' +
        '<img id="client_play" alt="play" class="control right" src="/media/images/play.png"/>' +
        '</div>');
    $(".song").click(function(){
        change_song($(this).attr("id"));
    });

    $(".control").each(function(){
       var action = $(this).attr("alt");
       $(this).click(function() {
           control(action);
           showMessage(action);
       });
    });

    $(".rate").each(function(){
        var action = $(this).attr("alt");
        var id=current_song_id;
        $(this).click(function() {
            rate(action,id);
        });
    });
}

function load_profile() {
    $.post("/japi/profile_info", {} , function(data) {
        var result = jQuery.parseJSON(data);
        if (!result.isAuthenticated) {
            $("#tab_profile").find(".totals").remove();
            $("#tab_profile").prepend('<div class="totals" id="not_logged">Вы не вошли. <div class="right"><a></a></div></div>');
            $("#login_form").show();
            $("#profile").hide();
        }
        else {
            $("#login_form").hide();
            $("#profile").show();
            $("#not_logged").hide();
            setup_profile_info(result);
        }
    });
}

function setup_profile_info(data) {
    $("#tab_profile").find(".totals").remove();
    $("#tab_profile").find(".song").remove();
    $("#tab_profile").prepend('<div class="totals">Вы вошли как '+data["username"]+'.<div class="right">Карма: '+data["carma"]+'</div></div>');
    var tracks = jQuery.parseJSON(data.tracks);
    $.each(tracks,function(index,item) {
        $("#tab_profile").append('<div class="song">'+item.fields.file+'' +
            '<div class="right"><span class="green">'+item.fields.likes+'</span>/<span class="red">'+item.fields.dislikes+'</span>&nbsp;' +
            '<img class="right" src="/media/images/lock'+item.fields.is_blocked+'.png"></div>' +
            '</div>');

    });
}

links_handler = function() {
    $(".link").click(function(e) {
        console.log("nsa");
        if (!$(e.target).hasClass('.link')) {
        var url =  $(this).attr("href");
        if (url != undefined) window.location = url;
        }
    });
}

forms_handler = function() 
{

    $(".form").each(function(index) {
        $('<a class="expand button">'+$(this).attr("title")+'</a>').insertBefore($(this));
        $(this).hide("normal");
    });

	$(".expand").live("click",function() {
        var jForm = $(this).next(".form");
	    jForm.show("normal");
		$(this).hide("normal");
		jForm.wrap('<form>');
        jForm.prepend('<h2>'+jForm.attr("title")+'</h2>');
		jForm.append('<br/><a class="submit button">OK</a>');
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
    current_track = track;
    current_song_id = track.id;
    $("#download_link").attr("href", "/media/music/"+track.file);

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
    } else showMessage("Неправильные данные. Войти не получается.");
}

function refistrationCallback(data) {
    var result = jQuery.parseJSON(data);
    if (result.Status) {
        showMessage("Успешная регистрация. Теперь можно пользоваться плеером. Запоминайте свои пароли, пожалуйста.");
        $("#log_form").find("#id_username").val($("#reg_form").find("#id_username").val());
        $("#log_form").find("#id_password").val($("#reg_form").find("#id_password1").val());
        $("#log_form").prev("a.expand").click();
        $("#log_form").find(".submit").click();
    } else showMessage("Неправильные данные. Зарегистрировать не получается.");
}

function client_reload() {
    $.post("/japi/reload", {} , function(data) {
        console.log(data);
    });
}

function showMessage(msg) {
    var modal = "<div class='modal'>"+msg+"</div>";
    $("html").append(modal);


    setTimeout(function() {
        $(".modal").fadeOut("slow",function() {
            $("html").remove(".modal");
        });
    }, 3000);
}

function control(action) {
    $.post("/japi/control", {"action": action} , function(data) {
        console.log(data);
    });
}


function rate(action,id) {
    if (action == "like") {
        $.post("/japi/like", { id: id } , function(data) {
            showMessage("Спасибо! Ваш голос учтен.")
        });
    }
    if (action == "dislike") {
        $.post("/japi/dislike", { id: id } , function(data) {
            showMessage("Спасибо! Ваш голос учтен.")
        });
    }
}