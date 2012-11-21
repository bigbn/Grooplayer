#-*- coding: utf-8 -*-
from decorators import render_to
from models import *
import Grooplayer.settings
import mpd
from django.http import HttpResponseRedirect
#import logging

@render_to("journal.html")
def journal(request):
    client = mpd.MPDClient()
    client.timeout = 10
    client.idletimeout = None
    client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)
    status = client.status()
    journal = Action.objects.all().order_by("-date")
    return {"status": status, "journal": journal}

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
def mainpage(request, id=None, action=None):
    client = mpd.MPDClient()
    client.timeout = 10
    client.idletimeout = None
    client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)
    
    if request.user.is_authenticated():
        profile = user_profile(request.user)
    
    if action:
        if request.user.is_authenticated():
            if action == "play":
                client.play()
                profile.take(1)
                log(request.user, "used the play button")
            elif action == "stop":
                client.stop()
                profile.take(1)
                log(request.user, "used the stop button")
            elif action == "pause":
                client.pause()
                profile.take(1)
                log(request.user, "used the pause button")
            return HttpResponseRedirect("/")
        else:
            return HttpResponseRedirect("/login/")
    
    if id:
        if request.user.is_authenticated():
            client.playid(id)
            profile.take(1)
            log(request.user, "changed song to #%s" % id)
            return HttpResponseRedirect("/")
        else:
            return HttpResponseRedirect("/login/")
    
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
    
    if request.user.is_authenticated():
        carma = profile.carma
    else:
        carma = "0"
    
    return {"playlist": playlist, "current_song": current_song, "next_song": next_song[0], "status": status , "carma": carma}
