#-*- coding: utf-8 -*-
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from base.models import Action,Track,user_profile
import Grooplayer.settings
import mpd
import logging

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