#-*- coding: utf-8 -*-
from django.contrib import admin
from models import Track,UserProfile


class TracksAdmin(admin.ModelAdmin):
    pass
admin.site.register(Track, TracksAdmin)

class UserProfileAdmin(admin.ModelAdmin):
    pass
admin.site.register(UserProfile, UserProfileAdmin)