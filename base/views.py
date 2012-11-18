#-*- coding: utf-8 -*-
from decorators import render_to
from models import *
import mpd
from django.http import HttpResponseRedirect
#import logging


@render_to("index.html")
def mainpage(request,id = None, action = None):
    client = mpd.MPDClient()
    client.timeout = 10
    client.idletimeout = None
    client.connect("localhost", 6600)
    
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
    next_song = [{}]
    try:
        next_song = client.playlistinfo(status['nextsong'])
    except:
        pass
    client.close()
    client.disconnect()
    
    return {"playlist": playlist, "current_song": current_song, "next_song": next_song[0], "status": status }
