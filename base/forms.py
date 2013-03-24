from django.forms import ModelForm
from models import Track

# Create the form class.
class TrackForm(ModelForm):
    class Meta:
        model = Track
        exclude = ('user','date','title','likes','dislikes')
    
    def __init__(self, *args, **kwargs):
        self._user = kwargs.pop('user')
        super(TrackForm, self).__init__(*args, **kwargs)
        self.fields['file'].widget.attrs.update({'accept': 'audio/mpeg'})

    def save(self, commit=True):
        inst = super(TrackForm, self).save(commit=False)
        inst.user = self._user
        inst.count = 0
        if commit:
            inst.save()
        return inst
