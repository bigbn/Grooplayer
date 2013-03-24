String.prototype.format = function() {
    var formatted = this;
    for (arg in arguments) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};

function Track(id, author, title) {
    this.id = id;
    this.author = author;
    this.title = title;
    this.containers = new Object();
    this.html = new String();
    this.basicContainer = "<div class='container'>{0}</div>";
    this.init();
}

Track.prototype = {
    init: function() {
        //this.setAuthor(this.author);
        this.setTitle(this.title);
    },

    setAuthor: function(author) {
        this.author = author;
        var container_ = "<div class='author'>{0}</div>".format(this.author);
        this.containers["author"] =  this.basicContainer.format(container_);
    },
    
    setTitle: function(title) {
        this.title = title;
        this.containers["title"] = "<div class='title'>{1} - {0}</div>".format(this.title, this.author);
    },
    render: function() {

        content_ = new String();
        $.each(this.containers, function (key,value) {
           content_ += value;
        });
        this.content = content_;
        this.html="<div id='{0}' class='jidget'>{1}</div>".format(this.id, this.content);
        return(this.html);
    }
}

$.getJSON('http://192.168.0.97/japi/playlist/', function(data) {
  $.each(data, function(key,value) {
    var item = new Track(value["id"],value["artist"], value["title"]);
    $("#playlist").append(item.render());
  });
    $.getJSON('http://192.168.0.97/japi/library/', function(data) {
      $.each(data, function(key,value) {
        var item = new Track(value["id"],value["artist"], value["title"]);
        $("#library").append(item.render());

      });
      $("img").hide("slow");
      $("#playlist").show("normal");
    });
});
$(document).ready(function() {
    $("#library_link").bind("click",function(){
        $("#playlist").hide("normal");
        $("#library").show("normal");
    });
    
    $("#playlist_link").bind("click",function(){
        $("#library").hide("normal");
        $("#playlist").show("normal");
    });
    
});

