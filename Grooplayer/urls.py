from django.conf.urls import patterns, include, url
import settings
from django.views.generic import TemplateView

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'base.views.mainpage'),
    url(r'^journal/$', 'base.views.journal'),
    url(r'^library/$', 'base.views.library'),
    url(r'^profile/$', 'base.views.profile'),
    url(r'^play/(?P<id>\d+)/$', 'base.views.mainpage'),
    url(r'^control/(?P<action>.*$)','base.views.mainpage'),
    url(r'^media/(?P<path>.*$)',
          'django.views.static.serve',
          {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
    url(r'^japi/', include('japi.urls')),
    url(r'^login/$', 'django.contrib.auth.views.login', {'template_name': 'login.html'}),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {'template_name': 'logout.html'}),
    url(r'^accounts/', include('registration.urls')),
    url(r'^admin/', include(admin.site.urls)),
#    url(r'^faq/$', TemplateView.as_view(template_name="faq.html")
)
