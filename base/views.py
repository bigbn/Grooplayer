#-*- coding: utf-8 -*-
from decorators import render_to
from models import *
import Grooplayer.settings
import mpd
from django.http import HttpResponseRedirect
from Grooplayer.httpauth import *
#import logging

@logged_in_or_basicauth()
@render_to("library.html")
def library(request):
    client = mpd.MPDClient()
    client.timeout = 10
    client.idletimeout = None
    client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)
    status = client.status()
    library = client.listallinfo()
    return {"status": status, "library": library}

@render_to("index.html")
def mainpage(request,id = None, action = None):
    client = mpd.MPDClient()
    client.timeout = 10
    client.idletimeout = None
    client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)
    
    if action:
        if action == "play":
            client.play()
        elif action == "stop":
            client.stop()
        elif action == "pause":
            client.pause()
        return HttpResponseRedirect("/")
    
    if id:
        client.playid(id)
        return HttpResponseRedirect("/")
    
    playlist = client.playlistinfo()

    current_song = client.currentsong()
    status = client.status()
    status['volume'] = str((int(status['volume'])-80)*5)
    next_song = [{}]
    try:
        next_song = client.playlistinfo(status['nextsong'])
    except:
        pass
    client.close()
    client.disconnect()
    
    return {"playlist": playlist, "current_song": current_song, "next_song": next_song[0], "status": status }
