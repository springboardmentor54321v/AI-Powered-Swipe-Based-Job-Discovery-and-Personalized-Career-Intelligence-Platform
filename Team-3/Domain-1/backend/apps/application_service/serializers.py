from rest_framework import serializers
from .models import Application, ApplicationStatusEvent

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'

class ApplicationStatusEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationStatusEvent
        fields = '__all__'