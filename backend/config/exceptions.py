from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError
from django.http import Http404
from rest_framework.exceptions import PermissionDenied, NotAuthenticated, AuthenticationFailed, ValidationError


def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler to ensure consistent, secure, and clear JSON error responses.

    HTTP Status Codes Enforced:
    - 400 Bad Request (Validation & Integrity errors)
    - 401 Unauthorized (Authentication failures)
    - 403 Forbidden (Permission & Role errors)
    - 404 Not Found (Resource missing)
    - 500 Internal Server Error (Unhandled server errors, masked safely)
    """
    # Call REST framework's default exception handler first to get the standard response
    response = exception_handler(exc, context)

    if response is None:
        # Handle Database Integrity Errors (e.g., UniqueConstraint violation)
        if isinstance(exc, IntegrityError):
            return Response(
                {"detail": "A database constraint violation occurred. Duplicate resource or invalid reference."},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Handle Http404 unhandled by DRF
        elif isinstance(exc, Http404):
            return Response(
                {"detail": "The requested resource was not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        # Mask unexpected 500 Internal Server Errors cleanly without exposing sensitive info
        return Response(
            {"detail": "An internal server error occurred. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Normalize error response data format
    if isinstance(response.data, list):
        response.data = {"detail": response.data[0] if response.data else "Invalid input."}

    return response
