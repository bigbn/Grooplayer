# -*- coding: utf-8 -*-
# Example line for crontab:
#00 08-19 * * 2-6 python /home/bigbn/Repo/Grooplayer/karma_update.py

import os
import random
os.chdir("/home/groo/")

from django.core.management import setup_environ
import Grooplayer.settings
setup_environ(Grooplayer.settings)

from base.models import Track
from django.db.models import Sum,Count
import mpd

client = mpd.MPDClient()
client.timeout = 10
client.idletimeout = None
client.connect(Grooplayer.settings.MPD_SERVER,Grooplayer.settings.MPD_PORT)
if client.status()['state'] == "stop":

    total_info = Track.objects.aggregate(Count('id'), Sum('likes'))
    middle_likes_karma = (float(total_info['likes__sum'])/float(total_info['id__count']))
   
     #TODO: проверить что в журнале последняя запись не STOP
    client.clear()
    for song in Track.objects.all():
        if (song.dislikes):
            song_karma = float(song.likes) / float(song.likes)
        else:
            song_karma = song.likes

        if song_karma < .5:
            chance = random.choice([1,1,0,0,0,0,0,0,0]) #делаем вероятность попадания в плэйлист меньше
        elif song_karma > middle_likes_karma:
            chance = random.choice([1,1,1,1,1,1,1,1,0,0]) #делаем вероятность попадания в плэйлист больше
            #todo: Добавить ее в топ
        elif song_karma >= .5: 
            chance = random.choice([1,1,1,1,1,0,0,0,0,0]) #делаем вероятность попадания в плэйлист обычной

        if chance:
            tracks = client.find("file",song.filename())
            if len(tracks):
                client.add(tracks[0]['file'])
    
    client.shuffle()
    client.play()
else:
   print "Player playing. Nothing to do"

client.disconnect()
