from rest_framework import permissions


class IsBuyer(permissions.BasePermission):
    """
    Permission check for BUYER role.
    User must be authenticated and have role == 'BUYER'.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'BUYER'
        )


class IsSupplier(permissions.BasePermission):
    """
    Permission check for SUPPLIER role.
    User must be authenticated and have role == 'SUPPLIER'.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'SUPPLIER'
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit/delete it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return hasattr(obj, 'created_by') and obj.created_by == request.user
