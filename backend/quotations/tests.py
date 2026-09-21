from datetime import timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rfqs.models import RFQ
from .models import Quotation

User = get_user_model()


class QuotationAPITests(APITestCase):

    def setUp(self):
        # Create Buyer 1
        self.buyer_1 = User.objects.create_user(
            email='buyer1@example.com',
            password='Password123!',
            name='Buyer One',
            role='BUYER'
        )

        # Create Buyer 2
        self.buyer_2 = User.objects.create_user(
            email='buyer2@example.com',
            password='Password123!',
            name='Buyer Two',
            role='BUYER'
        )

        # Create Supplier 1
        self.supplier_1 = User.objects.create_user(
            email='supplier1@example.com',
            password='Password123!',
            name='Supplier One',
            role='SUPPLIER'
        )

        # Create Supplier 2
        self.supplier_2 = User.objects.create_user(
            email='supplier2@example.com',
            password='Password123!',
            name='Supplier Two',
            role='SUPPLIER'
        )

        # Create Open RFQ for Buyer 1
        self.open_rfq = RFQ.objects.create(
            buyer=self.buyer_1,
            product_name='Industrial Generators 500kW',
            description='Need 2 units of heavy generators',
            quantity=2,
            delivery_location='Houston, TX',
            deadline=timezone.now() + timedelta(days=14),
            status='OPEN'
        )

        # Create Closed RFQ for Buyer 1
        self.closed_rfq = RFQ.objects.create(
            buyer=self.buyer_1,
            product_name='Solar Panels 400W',
            description='Need 100 panels',
            quantity=100,
            delivery_location='Phoenix, AZ',
            deadline=timezone.now() + timedelta(days=14),
            status='CLOSED'
        )

        # Endpoint URLs
        self.submit_url = reverse('rfq_quotations_list_create', kwargs={'rfq_id': self.open_rfq.id})
        self.closed_submit_url = reverse('rfq_quotations_list_create', kwargs={'rfq_id': self.closed_rfq.id})
        self.my_quotations_url = reverse('my_quotations_list')

        # Sample valid payload
        self.valid_payload = {
            'quoted_price': '12500.00',
            'estimated_delivery_time': '10 business days',
            'message': 'We can deliver directly from our Texas warehouse.'
        }

    # -------------------------------------------------------------
    # SUBMIT QUOTATION TESTS (POST /api/rfqs/{rfq_id}/quotations/)
    # -------------------------------------------------------------
    def test_submit_quotation_as_supplier_success(self):
        """1. Authenticated SUPPLIER can submit a quotation for an OPEN RFQ"""
        self.client.force_authenticate(user=self.supplier_1)
        response = self.client.post(self.submit_url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['quoted_price'], '12500.00')
        self.assertEqual(response.data['supplier_email'], self.supplier_1.email)
        self.assertEqual(Quotation.objects.count(), 1)

    def test_submit_quotation_as_buyer_fails(self):
        """2. BUYER users cannot submit quotations (403 Forbidden)"""
        self.client.force_authenticate(user=self.buyer_1)
        response = self.client.post(self.submit_url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Quotation.objects.count(), 0)

    def test_submit_quotation_unauthenticated_fails(self):
        """3. Unauthenticated users cannot submit quotations (401 Unauthorized)"""
        response = self.client.post(self.submit_url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Quotation.objects.count(), 0)

    def test_submit_quotation_for_closed_rfq_fails(self):
        """4. SUPPLIER cannot submit a quotation for a CLOSED RFQ (400 Bad Request)"""
        self.client.force_authenticate(user=self.supplier_1)
        response = self.client.post(self.closed_submit_url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)
        self.assertEqual(Quotation.objects.count(), 0)

    def test_submit_duplicate_quotation_fails(self):
        """5. SUPPLIER cannot submit duplicate quotation for the same RFQ (400 Bad Request)"""
        self.client.force_authenticate(user=self.supplier_1)

        # First submission succeeds
        first_resp = self.client.post(self.submit_url, self.valid_payload, format='json')
        self.assertEqual(first_resp.status_code, status.HTTP_201_CREATED)

        # Second submission for same RFQ fails
        second_resp = self.client.post(self.submit_url, self.valid_payload, format='json')
        self.assertEqual(second_resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Quotation.objects.count(), 1)

    # -------------------------------------------------------------
    # FIELD VALIDATION TESTS
    # -------------------------------------------------------------
    def test_validation_quoted_price_zero_or_negative(self):
        """6. Quoted price <= 0 raises validation error (400 Bad Request)"""
        self.client.force_authenticate(user=self.supplier_1)
        payload = self.valid_payload.copy()
        payload['quoted_price'] = '0.00'
        response = self.client.post(self.submit_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quoted_price', response.data)

        payload['quoted_price'] = '-150.00'
        response_neg = self.client.post(self.submit_url, payload, format='json')
        self.assertEqual(response_neg.status_code, status.HTTP_400_BAD_REQUEST)

    def test_validation_missing_estimated_delivery_time(self):
        """7. Missing or blank estimated delivery time raises validation error (400 Bad Request)"""
        self.client.force_authenticate(user=self.supplier_1)
        payload = self.valid_payload.copy()
        payload['estimated_delivery_time'] = '   '
        response = self.client.post(self.submit_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('estimated_delivery_time', response.data)

    def test_message_optional(self):
        """8. Message field is optional"""
        self.client.force_authenticate(user=self.supplier_1)
        payload = {
            'quoted_price': '9900.00',
            'estimated_delivery_time': '5 days'
        }
        response = self.client.post(self.submit_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Quotation.objects.first().message, '')

    # -------------------------------------------------------------
    # VIEW QUOTATIONS TESTS (GET /api/rfqs/{rfq_id}/quotations/ & GET /api/quotations/my/)
    # -------------------------------------------------------------
    def test_buyer_view_quotations_for_own_rfq(self):
        """9. Owning Buyer can view all quotations received for their RFQ"""
        # Supplier 1 submits quote
        Quotation.objects.create(
            rfq=self.open_rfq,
            supplier=self.supplier_1,
            quoted_price=12000.00,
            estimated_delivery_time='7 days'
        )
        # Supplier 2 submits quote
        Quotation.objects.create(
            rfq=self.open_rfq,
            supplier=self.supplier_2,
            quoted_price=11500.00,
            estimated_delivery_time='5 days'
        )

        # Buyer 1 (owner) views quotations
        self.client.force_authenticate(user=self.buyer_1)
        response = self.client.get(self.submit_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_buyer_cannot_view_quotations_for_other_buyer_rfq(self):
        """10. Buyer cannot view quotations for another buyer's RFQ (403 Forbidden)"""
        Quotation.objects.create(
            rfq=self.open_rfq,
            supplier=self.supplier_1,
            quoted_price=12000.00,
            estimated_delivery_time='7 days'
        )

        # Buyer 2 (non-owner) attempts to view Buyer 1's RFQ quotations
        self.client.force_authenticate(user=self.buyer_2)
        response = self.client.get(self.submit_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_supplier_view_own_quotations_via_my_endpoint(self):
        """11. Supplier can view all their submitted quotations via GET /api/quotations/my/"""
        # Create quote for Open RFQ
        q1 = Quotation.objects.create(
            rfq=self.open_rfq,
            supplier=self.supplier_1,
            quoted_price=12000.00,
            estimated_delivery_time='7 days'
        )

        self.client.force_authenticate(user=self.supplier_1)
        response = self.client.get(self.my_quotations_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], q1.id)

    def test_buyer_cannot_access_my_quotations_endpoint(self):
        """12. BUYER cannot access GET /api/quotations/my/ (403 Forbidden)"""
        self.client.force_authenticate(user=self.buyer_1)
        response = self.client.get(self.my_quotations_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
