from django.db import models
from django.conf import settings
from rfqs.models import RFQ


class Quotation(models.Model):
    """
    Quotation model representing a price bid submitted by a Supplier for an RFQ.
    Enforces a database UniqueConstraint to ensure one quotation per supplier per RFQ.
    """
    rfq = models.ForeignKey(
        RFQ,
        on_delete=models.CASCADE,
        related_name='quotations'
    )
    supplier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quotations'
    )
    quoted_price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )
    estimated_delivery_time = models.CharField(max_length=255)
    message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['rfq', 'supplier'],
                name='unique_rfq_supplier_quotation'
            )
        ]

    def __str__(self):
        return f"Quotation ${self.quoted_price} by {self.supplier.email} for RFQ #{self.rfq.id}"
