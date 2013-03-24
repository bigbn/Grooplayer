from django.conf.urls.defaults import *

urlpatterns = patterns('japi.views',
    (r'^volume/?$', 'volume'),
    (r'^playlist/?$', 'playlist'),
    (r'^library/?$', 'library'),
    (r'^like/?$', 'like'),
    (r'^dislike/?$', 'dislike'),
    (r'^karma/?$', 'karma'),
    (r'^toogle_block/?$', 'toogle_block'),
 )
