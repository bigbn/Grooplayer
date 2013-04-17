#-*- coding: utf-8 -*-
from decorators import render_to
from models import *
import Grooplayer.settings
import mpd
from django.http import HttpResponseRedirect
from forms import TrackForm
from django.contrib.auth.forms import AuthenticationForm
from registration.forms import RegistrationForm
from django.middleware.csrf import get_token
from ajaxuploader.views import AjaxFileUploader
from Grooplayer.backends import TrackUploadBackend

#from ID3 import *
import logging

@render_to("profile.html")
def profile(request):
    client = mpd.MPDClient()
    client.timeout = 10
    client.idletimeout = None
    client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)
    
    if request.method == 'POST':
        form = TrackForm(request.POST, request.FILES, user=request.user)
        if form.is_valid():
            instance = form.save(commit=True)
            client.update()
            return HttpResponseRedirect('/profile/')
    else:
        form = TrackForm(user=request.user)
        
    status = client.status()
    journal = Action.objects.all().order_by("-date")
    tracks = Track.objects.filter(user=request.user)
    return {"status": status, "journal": journal, "tracks": tracks,"form": form}

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
    """

    :param request:
    :param id:
    :param action:
    :return:
    """
    client = mpd.MPDClient()
    client.timeout = 10
    client.idletimeout = None
    client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)
    
    if request.user.is_authenticated():
        profile = user_profile(request.user)
        carma = profile.carma
    
    if action:
        if request.user.is_authenticated():
            if action == "play" and carma > 0:
                client.play()
                profile.take(2)
                log(request.user, "used the play button")
            elif action == "stop" and carma > 0:
                client.stop()
                profile.take(2)
                log(request.user, "used the stop button")
            elif action == "pause" and carma > 0:
                client.pause()
                profile.take(2)
                log(request.user, "used the pause button")
            return HttpResponseRedirect("/")
        else:
            return HttpResponseRedirect("/login/")
    
    if id:
        if request.user.is_authenticated():
            if carma > 0:
                client.playid(id)
                profile.take(2)
                log(request.user, "changed song to #%s" % id)
                return HttpResponseRedirect("/")
        else:
            return HttpResponseRedirect("/login/")
    
    playlist = client.playlistinfo()

    current_song = client.currentsong()
    status = client.status()
    #status['volume'] = str((int(status['volume'])-80)*5)
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

    login_form = AuthenticationForm(request=request)
    registration_form = RegistrationForm()
    upload_form = TrackForm(user=request.user)
    csrf_token = get_token(request)

    return {"playlist": playlist,
            "current_song": current_song,
            "next_song": next_song[0],
            "status": status ,
            "carma": carma,
            "login_form": login_form,
            "registration_form": registration_form,
            "upload_form": upload_form,
            'csrf_token': csrf_token}

import_uploader = AjaxFileUploader(backend=TrackUploadBackend)