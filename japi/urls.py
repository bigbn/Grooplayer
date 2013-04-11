from django.conf.urls.defaults import *

urlpatterns = patterns('japi.views',
    (r'^volume/?$', 'volume'),
    (r'^playlist/?$', 'playlist'),
    (r'^library/?$', 'library'),
    (r'^like/?$', 'like'),
    (r'^dislike/?$', 'dislike'),
    (r'^karma/?$', 'karma'),
    (r'^toogle_block/?$', 'toogle_block'),
    (r'^is_track_changed/?$', 'is_track_changed'),
    (r'^change_track/?$', 'change_track'),
    (r'^journal/?$', 'journal'),
    (r'^login/?$', 'login'),
    (r'^profile_info/?$', 'profile_info'),
 )
