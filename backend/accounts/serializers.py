from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Public user representation serializer.
    Excludes sensitive fields like password.
    """
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'role', 'created_at')
        read_only_fields = ('id', 'created_at')


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with field validation and password hashing.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        validators=[validate_password]
    )
    role = serializers.ChoiceField(choices=User.Role.choices, required=True)

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password', 'role', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_email(self, value):
        normalized_email = value.lower().strip()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return normalized_email

    def create(self, validated_data):
        user = User.objects.create_user(
            name=validated_data['name'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role']
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom SimpleJWT token serializer to include user details in the token response payload.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims into the JWT token payload
        token['name'] = user.name
        token['email'] = user.email
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add extra user profile fields to the login response JSON
        data['user'] = UserSerializer(self.user).data
        return data
