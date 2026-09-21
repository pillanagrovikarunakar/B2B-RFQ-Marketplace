from rest_framework import serializers
from django.utils import timezone
from .models import RFQ


class RFQSerializer(serializers.ModelSerializer):
    buyer_email = serializers.ReadOnlyField(source='buyer.email')
    buyer_name = serializers.ReadOnlyField(source='buyer.name')

    class Meta:
        model = RFQ
        fields = [
            'id',
            'buyer',
            'buyer_email',
            'buyer_name',
            'product_name',
            'description',
            'quantity',
            'delivery_location',
            'deadline',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'buyer', 'buyer_email', 'buyer_name', 'created_at', 'updated_at']

    def validate_product_name(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("Product name is required.")
        return value.strip()

    def validate_description(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("Description is required.")
        return value.strip()

    def validate_quantity(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        return value

    def validate_delivery_location(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("Delivery location is required.")
        return value.strip()

    def validate_deadline(self, value):
        if value is None:
            raise serializers.ValidationError("Deadline is required.")
        if value <= timezone.now():
            raise serializers.ValidationError("Deadline must be a valid future date/time.")
        return value

    def validate_status(self, value):
        valid_statuses = [choice[0] for choice in RFQ.Status.choices]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Status must be one of: {', '.join(valid_statuses)}.")
        return value
