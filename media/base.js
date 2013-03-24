	/* Create a cache object */
	var cache = new LastFMCache();

	/* Create a LastFM object */
	var lastfm = new LastFM({
		apiKey    : 'f21088bf9097b49ad4e7f487abab981e',
		apiSecret : '7ccaec2093e33cded282ec7bc81c6fca',
		cache     : cache
	});

	/* Load some artist info. */
	lastfm.artist.getInfo({artist: current_song_artist,lang:"ru"}, {success: function(data){
	console.log(data);
	$("#next_song").html(data.artist.bio.content);
	$("#track_image").html("<img style='width: 100%; border-radius: 3px' src='"+data.artist.image[2]["#text"]+"'/>");
	/* Use data. */
	}, error: function(code, message){
		/* Show error message. */
	console.log(error);
	}});
