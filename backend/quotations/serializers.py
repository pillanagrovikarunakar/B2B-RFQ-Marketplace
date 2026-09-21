from rest_framework import serializers
from .models import Quotation


class QuotationSerializer(serializers.ModelSerializer):
    rfq_product_name = serializers.ReadOnlyField(source='rfq.product_name')
    supplier_name = serializers.ReadOnlyField(source='supplier.name')
    supplier_email = serializers.ReadOnlyField(source='supplier.email')

    class Meta:
        model = Quotation
        fields = [
            'id',
            'rfq',
            'rfq_product_name',
            'supplier',
            'supplier_name',
            'supplier_email',
            'quoted_price',
            'estimated_delivery_time',
            'message',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'rfq',
            'rfq_product_name',
            'supplier',
            'supplier_name',
            'supplier_email',
            'created_at',
            'updated_at',
        ]

    def validate_quoted_price(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Quoted price must be greater than 0.")
        return value

    def validate_estimated_delivery_time(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("Estimated delivery time is required.")
        return value.strip()

    def validate(self, attrs):
        request = self.context.get('request')
        rfq = self.context.get('rfq')

        if rfq:
            # Rule: Supplier cannot submit a quotation for a closed RFQ
            if rfq.status == 'CLOSED':
                raise serializers.ValidationError({"non_field_errors": ["Quotations cannot be submitted for a closed RFQ."]})

            # Rule: Supplier cannot submit duplicate quotation for the same RFQ
            if request and request.user and request.user.is_authenticated:
                if Quotation.objects.filter(rfq=rfq, supplier=request.user).exists():
                    raise serializers.ValidationError({"non_field_errors": ["You have already submitted a quotation for this RFQ."]})

        return attrs
