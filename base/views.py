#-*- coding: utf-8 -*-
from decorators import render_to
from models import *
from data import *
#import logging

@render_to("index.html")
def mainpage(request):
    return {}
