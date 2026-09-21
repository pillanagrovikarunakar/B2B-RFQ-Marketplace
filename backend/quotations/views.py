from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError

from rfqs.models import RFQ
from .models import Quotation
from .serializers import QuotationSerializer
from .permissions import CanAccessRFQQuotations, IsSupplierUser


class RFQQuotationListCreateView(APIView):
    """
    API view for managing quotations submitted for a specific RFQ.

    - POST /api/rfqs/{rfq_id}/quotations/ (SUPPLIER only)
    - GET /api/rfqs/{rfq_id}/quotations/ (Owning BUYER or submitting SUPPLIER)
    """
    permission_classes = [IsAuthenticated, CanAccessRFQQuotations]

    def post(self, request, rfq_id):
        if request.user.role != 'SUPPLIER':
            raise PermissionDenied("Only Supplier accounts can submit quotations.")

        rfq = get_object_or_404(RFQ, pk=rfq_id)

        # Rule: Supplier cannot submit a quotation for a closed RFQ
        if rfq.status == 'CLOSED':
            return Response(
                {"non_field_errors": ["Quotations cannot be submitted for a closed RFQ."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = QuotationSerializer(
            data=request.data,
            context={'request': request, 'rfq': rfq}
        )
        serializer.is_valid(raise_exception=True)

        try:
            serializer.save(rfq=rfq, supplier=request.user)
        except IntegrityError:
            return Response(
                {"non_field_errors": ["You have already submitted a quotation for this RFQ."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request, rfq_id):
        rfq = get_object_or_404(RFQ, pk=rfq_id)

        if request.user.role == 'BUYER':
            # Rule: Buyer can view quotations received for their own RFQ
            if rfq.buyer != request.user:
                raise PermissionDenied("You do not have permission to view quotations for another buyer's RFQ.")
            quotations = rfq.quotations.all()
        elif request.user.role == 'SUPPLIER':
            # Rule: Supplier can view their own submitted quotation for this RFQ
            quotations = rfq.quotations.filter(supplier=request.user)
        else:
            quotations = Quotation.objects.none()

        serializer = QuotationSerializer(quotations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyQuotationsListView(APIView):
    """
    API view for Suppliers to view all quotations they have submitted across all RFQs.

    - GET /api/quotations/my/ (SUPPLIER only)
    """
    permission_classes = [IsAuthenticated, IsSupplierUser]

    def get(self, request):
        if request.user.role != 'SUPPLIER':
            raise PermissionDenied("Only Supplier accounts can view their submitted quotations.")

        quotations = Quotation.objects.filter(supplier=request.user)
        serializer = QuotationSerializer(quotations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
