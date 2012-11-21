#-*- coding: utf-8 -*-
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from base.models import Action
import Grooplayer.settings
import mpd

@csrf_exempt
def volume(request):
    if request.method == "POST":
        if request.POST["value"]:
            volume = request.POST["value"]

            client = mpd.MPDClient()            
            client.timeout = 10
            client.idletimeout = None
            client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)
            #client.setvol(80+int(float(volume)*0.2))
            #Action(user = request.user, action = "changed the volume to %s" % volume).save()
            client.setvol(80+int((float(volume)*0.2)))
            client.close()
            client.disconnect()
            
    return HttpResponse(status=200)
