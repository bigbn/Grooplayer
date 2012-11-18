from django.conf.urls import patterns, include, url
import settings

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'base.views.mainpage'),
    url(r'^media/(?P<path>.*$)',
          'django.views.static.serve',
          {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
    url(r'^login/$', 'django.contrib.auth.views.login', {'template_name': 'login.html'}),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {'template_name': 'logout.html'}),
    url(r'^admin/', include(admin.site.urls)),
)