from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import RFQ
from .serializers import RFQSerializer
from .permissions import IsRFQOwnerOrSupplierReadOnly


class RFQViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Request for Quotations (RFQs).

    Routes:
    - POST /api/rfqs/ (BUYER only)
    - GET /api/rfqs/ (BUYER sees own RFQs; SUPPLIER sees OPEN RFQs)
    - GET /api/rfqs/{id}/ (BUYER sees own RFQ; SUPPLIER sees OPEN RFQ)
    - PUT /api/rfqs/{id}/ (BUYER owner only)
    - PATCH /api/rfqs/{id}/ (BUYER owner only)
    - DELETE /api/rfqs/{id}/ (BUYER owner only)
    """
    serializer_class = RFQSerializer
    permission_classes = [IsAuthenticated, IsRFQOwnerOrSupplierReadOnly]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return RFQ.objects.none()

        if user.role == 'BUYER':
            return RFQ.objects.filter(buyer=user)
        elif user.role == 'SUPPLIER':
            return RFQ.objects.filter(status=RFQ.Status.OPEN)

        return RFQ.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != 'BUYER':
            raise PermissionDenied("Only Buyer accounts can create RFQs.")
        serializer.save(buyer=self.request.user)
