from django.conf.urls.defaults import *
from django.views.generic.list_detail import object_detail

urlpatterns = patterns('japi.views',
    (r'^volume/?$', 'volume'),
    (r'^like/?$', 'like'),
    (r'^dislike/?$', 'dislike'),
    (r'^karma/?$', 'karma'),
 )
