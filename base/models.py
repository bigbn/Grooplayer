from django.db import models
from django.contrib.auth.models import User

def user_profile(user):
    profile = None
    try:
        profile = user.get_profile()
    except UserProfile.DoesNotExist:
        UserProfile(user=user).save()
        profile = user.get_profile()
    return profile

def log(user,action):
    Action(user = user, action = action).save()
    records = Action.objects.all().order_by("-date")[:30]
    if Action.objects.count() > 30:
        Action.objects.exclude(pk__in=records).delete()

class UserProfile(models.Model):
    user = models.ForeignKey(User, unique=True, related_name='profile', null=False)
    carma = models.IntegerField(default=10)
    
    def take(self, count):
        self.carma -= count
        self.save()
        
    def give(self, count):
        self.carma += count
        self.save()
    
    def __unicode__(self):
        return u'%s' % (self.user)
    
class Action(models.Model):
    user = models.ForeignKey(User)
    date = models.DateTimeField(u'Date', auto_now_add=True)
    action = models.TextField(u'Text', max_length=1000)
    
class Track(models.Model):
    user = models.ForeignKey(User)
    date = models.DateTimeField(u'Date', auto_now_add=True)
    title = models.CharField(u'Title', max_length=300, null=True, blank=True)
    file = models.FileField(u'Track',upload_to = 'music',blank=False, null=False, max_length=300)
    likes = models.IntegerField(default=1)
    dislikes = models.IntegerField(default=0)
    
    def like(self, count):
        self.likes += 1
        self.save()
        
    def dislike(self, count):
        self.dislikes -= 1
        self.save()

    def __unicode__(self):
        return u'%s' % (self.file)