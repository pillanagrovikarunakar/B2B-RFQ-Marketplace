from rest_framework import permissions


class IsBuyer(permissions.BasePermission):
    """
    Permission to allow only authenticated Buyers.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'BUYER'
        )


class IsRFQOwnerOrSupplierReadOnly(permissions.BasePermission):
    """
    Object and View level permission rules for RFQs:
    1. Creating an RFQ: Authenticated BUYER only.
    2. Listing/Detailing RFQs:
       - BUYER can access only their own RFQs.
       - SUPPLIER can access only OPEN RFQs in read-only mode.
    3. Editing/Deleting RFQs:
       - Only the owning BUYER can update or delete their RFQ.
       - Users cannot edit or delete another user's RFQ or if they are a SUPPLIER.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        if request.method == 'POST':
            return request.user.role == 'BUYER'

        return True

    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False

        if request.user.role == 'BUYER':
            # Buyer can view, edit, or delete only their own RFQs
            return obj.buyer == request.user

        if request.user.role == 'SUPPLIER':
            # Supplier can only view OPEN RFQs
            if request.method in permissions.SAFE_METHODS:
                return obj.status == 'OPEN'
            return False

        return False
