# Example line for crontab:
#00 08-19 * * 2-6 python /home/bigbn/Repo/Grooplayer/karma_update.py

import os
os.chdir("/home/groo/")

from django.core.management import setup_environ
import Grooplayer.settings
setup_environ(Grooplayer.settings)

from base.models import user_profile
from django.contrib.auth.models import User 

for user in User.objects.all():
    profile = user_profile(user)
    if profile.carma <= 10:
        profile.give(1)
