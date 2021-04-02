from datetime import datetime

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers, fields
from rest_framework.validators import UniqueValidator

from .models import Message, Follow, Profile
from django.contrib.auth.models import User
from django.db import models

class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Profile
        fields = ('id','bio','image'
        )


class PublicUserProfileSerializer(serializers.HyperlinkedModelSerializer):
    profile = ProfileSerializer(read_only=False)

    class Meta:
        model = User
        fields = ('id','username','first_name', 'last_name', 'profile','url'
        )

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile')
        profile = instance.profile

        print(profile_data)
        profileSerializer = ProfileSerializer(data=profile_data)
        if (profileSerializer.is_valid()):
            profile.bio = profile_data.get('bio',profile.bio)
            profile.image = profile_data.get('image',profile.image)
            profile.save()

        return super(PublicUserProfileSerializer, self).update(instance,validated_data)


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id','username','email','url')
    #
    # def create(self, validated_data):
    #     return User.objects.create_user(**validated_data)


class CreateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id','content','user','replyTo']

class MessageSerializer(serializers.HyperlinkedModelSerializer):
    user = PublicUserProfileSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True)

    class Meta:
        model = Message
        fields = ['id','date','content','image','user_id','user','replyTo','url',]

class FollowSerializer(serializers.ModelSerializer):
    user = serializers.CreateOnlyDefault(serializers.HiddenField(default=serializers.CurrentUserDefault()))
    # user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Follow
        fields = ['id','user','following','date','url']