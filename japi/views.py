#-*- coding: utf-8 -*-
from django.contrib.auth import authenticate, logout, login as django_login
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from base.models import *
import Grooplayer.settings
import mpd
import logging
import simplejson as json
from django.core import serializers

@csrf_exempt
def playlist(request):
    client = mpd.MPDClient()
    client.timeout = 10
    client.idletimeout = None
    client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)
    playlist = client.playlistinfo()
    response=json.dumps(playlist)
    return HttpResponse(response)

@csrf_exempt
def library(request):
    client = mpd.MPDClient()
    client.timeout = 10
    client.idletimeout = None
    client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)
    library = client.listallinfo()
    response=json.dumps(library)
    return HttpResponse(response)

@csrf_exempt
def volume(request):
    if request.method == "POST":
        if request.POST["value"]:
            volume = request.POST["value"]
            client = mpd.MPDClient()            
            client.timeout = 10
            client.idletimeout = None
            client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)
            client.setvol(volume)
            #Action(user = request.user, action = "changed the volume to %s" % volume).save()
            #client.setvol(80+int((float(volume)*0.2)))
            client.close()
            client.disconnect()
            
    return HttpResponse(status=200)

@csrf_exempt
def like(request):
    if request.method == "POST":
        if request.POST["id"]:
            pk = request.POST["id"]            
            client = mpd.MPDClient()            
            client.timeout = 10
            client.idletimeout = None
            client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)
            filename = client.playlistid(pk)[0]['file']
            track = Track.objects.filter(file__endswith=filename)[0]
            track.like(1)
            profile = user_profile(request.user)
            if request.user == track.user:
                profile.take(3)
            else:
                profile.take(1)

    return HttpResponse(status=200)

@csrf_exempt
def dislike(request):
    if request.method == "POST":
        if request.POST["id"]:
            pk = request.POST["id"]            
            client = mpd.MPDClient()            
            client.timeout = 10
            client.idletimeout = None
            client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)
            filename = client.playlistid(pk)[0]['file']
            track = Track.objects.filter(file__endswith=filename)[0]
            track.dislike(1)
            profile = user_profile(request.user)
            profile.take(1)

    return HttpResponse(status=200)


@csrf_exempt
def karma(request):
    #profile = user_profile(request.user)
    #profile.carma
    return HttpResponse(status=200)

@csrf_exempt
def toogle_block(request):
    if request.method == "POST":
        if request.POST["id"]:
            pk = request.POST["id"]       
            track = Track.objects.get(pk=pk)
            if track.is_blocked:
                track.is_blocked = False
            else:
                track.is_blocked = True
            track.save()
 
    return HttpResponse(status=200)

@csrf_exempt
def is_track_changed(request):
    result = {"isChanged": False}
    if request.method == "POST":
        if request.POST["id"]:
            pk = request.POST["id"]
            client = mpd.MPDClient()
            client.timeout = 10
            client.idletimeout = None
            client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)

            current_song = client.currentsong()

            client.close()
            client.disconnect()

            if pk != current_song["id"]:
                result = {"isChanged": True, "newSong": current_song}

    response = json.dumps(result)
    return HttpResponse(response)

@csrf_exempt
def change_track(request):
    if request.method == "POST":
        if request.POST["id"]:
            pk = request.POST["id"]

            client = mpd.MPDClient()
            client.timeout = 10
            client.idletimeout = None
            client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)

            if request.user.is_authenticated():
                profile = user_profile(request.user)
                carma = profile.carma

                if request.user.is_authenticated():
                    if carma > 0:
                        client.playid(pk)
                        profile.take(2)
                        log(request.user, "changed song to #%s" % pk)
                        response = json.dumps({"isChanged": True})
                        return HttpResponse(response)
    return HttpResponse(status=200)

@csrf_exempt
def journal(request):
    client = mpd.MPDClient()
    client.timeout = 10
    client.idletimeout = None
    client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)
    journal = Action.objects.all().order_by("-date")
    response=json.dumps(str(journal.values()))
    return HttpResponse(response)

def login(request):
    status = False
    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(username=username, password=password)
    if user is not None:
        if user.is_active:
            django_login(request, user)
            logging.info(u"%s вошел на сайт." % str(username) )
            status = True
        else:
            status = False
    result = {"Status": status}
    response = json.dumps(result)
    return HttpResponse(response)

@csrf_exempt
def profile_info(request):
    is_authenticated = False
    carma = 0
    username = ""
    tracks = []
    if request.user.is_authenticated():
        profile = user_profile(request.user)
        is_authenticated = True
        carma = profile.carma
        username = request.user.username
        tracks_objects = Track.objects.filter(user=request.user)
        tracks = serializers.serialize("json", tracks_objects)

    result = {"isAuthenticated": is_authenticated,
              "carma": carma,
              "username": username ,
              "tracks": tracks}

    response = json.dumps(result)
    return HttpResponse(response)