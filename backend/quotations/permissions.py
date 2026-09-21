from rest_framework import permissions


class IsSupplierUser(permissions.BasePermission):
    """
    Permission check to allow access only to authenticated SUPPLIER users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'SUPPLIER'
        )


class IsBuyerUser(permissions.BasePermission):
    """
    Permission check to allow access only to authenticated BUYER users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'BUYER'
        )


class CanAccessRFQQuotations(permissions.BasePermission):
    """
    Permission rules for listing / submitting quotations on a specific RFQ:
    - POST: SUPPLIER role only.
    - GET:
      - BUYER role: Must own the RFQ.
      - SUPPLIER role: Authenticated supplier can access endpoint (will be filtered to own quotes).
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        if request.method == 'POST':
            return request.user.role == 'SUPPLIER'

        return True
