from datetime import timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import RFQ

User = get_user_model()


class RFQAPITests(APITestCase):

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

        # Create Supplier
        self.supplier = User.objects.create_user(
            email='supplier1@example.com',
            password='Password123!',
            name='Supplier One',
            role='SUPPLIER'
        )

        # Standard future deadline
        self.future_deadline = (timezone.now() + timedelta(days=7)).isoformat()

        # Endpoint URL
        self.rfq_list_url = reverse('rfq-list')

        # Sample valid RFQ payload
        self.valid_payload = {
            'product_name': 'Industrial Steel Tubes',
            'description': 'High grade seamless steel tubes 50mm diameter',
            'quantity': 500,
            'delivery_location': 'Building 4, Tech Park, Austin TX',
            'deadline': self.future_deadline,
            'status': 'OPEN'
        }

    # -------------------------------------------------------------
    # CREATE TESTS (POST /api/rfqs/)
    # -------------------------------------------------------------
    def test_create_rfq_as_buyer_success(self):
        """1. Authenticated BUYER can successfully create an RFQ"""
        self.client.force_authenticate(user=self.buyer_1)
        response = self.client.post(self.rfq_list_url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['product_name'], self.valid_payload['product_name'])
        self.assertEqual(response.data['buyer_email'], self.buyer_1.email)
        self.assertEqual(response.data['status'], 'OPEN')
        self.assertTrue(RFQ.objects.filter(id=response.data['id']).exists())

    def test_create_rfq_as_supplier_fails(self):
        """2. SUPPLIER users cannot create RFQs (403 Forbidden)"""
        self.client.force_authenticate(user=self.supplier)
        response = self.client.post(self.rfq_list_url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(RFQ.objects.count(), 0)

    def test_create_rfq_unauthenticated_fails(self):
        """3. Unauthenticated users cannot create RFQs (401 Unauthorized)"""
        response = self.client.post(self.rfq_list_url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(RFQ.objects.count(), 0)

    # -------------------------------------------------------------
    # LIST TESTS (GET /api/rfqs/)
    # -------------------------------------------------------------
    def test_list_rfqs_as_buyer(self):
        """4. Buyers can view ONLY their own RFQs"""
        # Create RFQ for Buyer 1
        rfq1 = RFQ.objects.create(
            buyer=self.buyer_1,
            product_name='Buyer 1 Open RFQ',
            description='Desc',
            quantity=10,
            delivery_location='Loc 1',
            deadline=timezone.now() + timedelta(days=5),
            status='OPEN'
        )

        # Create RFQ for Buyer 2
        rfq2 = RFQ.objects.create(
            buyer=self.buyer_2,
            product_name='Buyer 2 Open RFQ',
            description='Desc',
            quantity=20,
            delivery_location='Loc 2',
            deadline=timezone.now() + timedelta(days=5),
            status='OPEN'
        )

        self.client.force_authenticate(user=self.buyer_1)
        response = self.client.get(self.rfq_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only contain rfq1
        rfq_ids = [item['id'] for item in response.data]
        self.assertIn(rfq1.id, rfq_ids)
        self.assertNotIn(rfq2.id, rfq_ids)

    def test_list_rfqs_as_supplier(self):
        """5. Suppliers can browse OPEN RFQs across all buyers, but NOT CLOSED RFQs"""
        rfq_open = RFQ.objects.create(
            buyer=self.buyer_1,
            product_name='Open RFQ',
            description='Desc',
            quantity=10,
            delivery_location='Loc 1',
            deadline=timezone.now() + timedelta(days=5),
            status='OPEN'
        )
        rfq_closed = RFQ.objects.create(
            buyer=self.buyer_1,
            product_name='Closed RFQ',
            description='Desc',
            quantity=10,
            delivery_location='Loc 1',
            deadline=timezone.now() + timedelta(days=5),
            status='CLOSED'
        )

        self.client.force_authenticate(user=self.supplier)
        response = self.client.get(self.rfq_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rfq_ids = [item['id'] for item in response.data]
        self.assertIn(rfq_open.id, rfq_ids)
        self.assertNotIn(rfq_closed.id, rfq_ids)

    # -------------------------------------------------------------
    # DETAIL & OWNERSHIP TESTS (GET, PUT, PATCH, DELETE /api/rfqs/{id}/)
    # -------------------------------------------------------------
    def test_buyer_get_own_rfq_detail(self):
        """6. Buyer can view detail of their own RFQ"""
        rfq = RFQ.objects.create(
            buyer=self.buyer_1,
            product_name='My RFQ',
            description='Desc',
            quantity=10,
            delivery_location='Loc 1',
            deadline=timezone.now() + timedelta(days=5),
            status='OPEN'
        )
        url = reverse('rfq-detail', kwargs={'pk': rfq.id})
        self.client.force_authenticate(user=self.buyer_1)
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['product_name'], 'My RFQ')

    def test_buyer_cannot_view_or_modify_other_buyer_rfq(self):
        """7. Buyer cannot view, modify, or delete another buyer's RFQ"""
        rfq2 = RFQ.objects.create(
            buyer=self.buyer_2,
            product_name='Buyer 2 Private RFQ',
            description='Desc',
            quantity=10,
            delivery_location='Loc 2',
            deadline=timezone.now() + timedelta(days=5),
            status='OPEN'
        )
        url = reverse('rfq-detail', kwargs={'pk': rfq2.id})
        self.client.force_authenticate(user=self.buyer_1)

        # GET detail
        get_resp = self.client.get(url)
        self.assertIn(get_resp.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

        # PUT update
        put_resp = self.client.put(url, self.valid_payload, format='json')
        self.assertIn(put_resp.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

        # DELETE
        del_resp = self.client.delete(url)
        self.assertIn(del_resp.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_supplier_view_open_and_closed_rfq_detail(self):
        """8. Supplier can view detail of OPEN RFQ, but NOT CLOSED RFQ"""
        open_rfq = RFQ.objects.create(
            buyer=self.buyer_1,
            product_name='Open RFQ',
            description='Desc',
            quantity=10,
            delivery_location='Loc',
            deadline=timezone.now() + timedelta(days=5),
            status='OPEN'
        )
        closed_rfq = RFQ.objects.create(
            buyer=self.buyer_1,
            product_name='Closed RFQ',
            description='Desc',
            quantity=10,
            delivery_location='Loc',
            deadline=timezone.now() + timedelta(days=5),
            status='CLOSED'
        )

        self.client.force_authenticate(user=self.supplier)

        # Open RFQ detail -> 200 OK
        open_url = reverse('rfq-detail', kwargs={'pk': open_rfq.id})
        resp = self.client.get(open_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Closed RFQ detail -> 404 or 403
        closed_url = reverse('rfq-detail', kwargs={'pk': closed_rfq.id})
        resp_closed = self.client.get(closed_url)
        self.assertIn(resp_closed.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_supplier_cannot_edit_or_delete_rfq(self):
        """9. Supplier cannot update or delete any RFQ"""
        open_rfq = RFQ.objects.create(
            buyer=self.buyer_1,
            product_name='Open RFQ',
            description='Desc',
            quantity=10,
            delivery_location='Loc',
            deadline=timezone.now() + timedelta(days=5),
            status='OPEN'
        )
        url = reverse('rfq-detail', kwargs={'pk': open_rfq.id})
        self.client.force_authenticate(user=self.supplier)

        # PUT -> 403 Forbidden
        put_resp = self.client.put(url, self.valid_payload, format='json')
        self.assertEqual(put_resp.status_code, status.HTTP_403_FORBIDDEN)

        # DELETE -> 403 Forbidden
        del_resp = self.client.delete(url)
        self.assertEqual(del_resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_buyer_update_own_rfq_success(self):
        """10. Owning Buyer can update (PUT/PATCH) their RFQ"""
        rfq = RFQ.objects.create(
            buyer=self.buyer_1,
            product_name='Original Name',
            description='Desc',
            quantity=10,
            delivery_location='Loc',
            deadline=timezone.now() + timedelta(days=5),
            status='OPEN'
        )
        url = reverse('rfq-detail', kwargs={'pk': rfq.id})
        self.client.force_authenticate(user=self.buyer_1)

        # PATCH update
        patch_payload = {'quantity': 25, 'status': 'CLOSED'}
        response = self.client.patch(url, patch_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rfq.refresh_from_db()
        self.assertEqual(rfq.quantity, 25)
        self.assertEqual(rfq.status, 'CLOSED')

    def test_buyer_delete_own_rfq_success(self):
        """11. Owning Buyer can delete their RFQ"""
        rfq = RFQ.objects.create(
            buyer=self.buyer_1,
            product_name='To Delete',
            description='Desc',
            quantity=10,
            delivery_location='Loc',
            deadline=timezone.now() + timedelta(days=5),
            status='OPEN'
        )
        url = reverse('rfq-detail', kwargs={'pk': rfq.id})
        self.client.force_authenticate(user=self.buyer_1)

        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(RFQ.objects.filter(id=rfq.id).exists())

    # -------------------------------------------------------------
    # FIELD VALIDATION TESTS
    # -------------------------------------------------------------
    def test_validation_missing_product_name(self):
        """12. Blank product name raises validation error"""
        self.client.force_authenticate(user=self.buyer_1)
        payload = self.valid_payload.copy()
        payload['product_name'] = '   '
        response = self.client.post(self.rfq_list_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('product_name', response.data)

    def test_validation_missing_description(self):
        """13. Blank description raises validation error"""
        self.client.force_authenticate(user=self.buyer_1)
        payload = self.valid_payload.copy()
        payload['description'] = ''
        response = self.client.post(self.rfq_list_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('description', response.data)

    def test_validation_quantity_zero_or_negative(self):
        """14. Quantity <= 0 raises validation error"""
        self.client.force_authenticate(user=self.buyer_1)
        payload = self.valid_payload.copy()
        payload['quantity'] = 0
        response = self.client.post(self.rfq_list_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quantity', response.data)

        payload['quantity'] = -5
        response_neg = self.client.post(self.rfq_list_url, payload, format='json')
        self.assertEqual(response_neg.status_code, status.HTTP_400_BAD_REQUEST)

    def test_validation_missing_delivery_location(self):
        """15. Blank delivery location raises validation error"""
        self.client.force_authenticate(user=self.buyer_1)
        payload = self.valid_payload.copy()
        payload['delivery_location'] = ''
        response = self.client.post(self.rfq_list_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('delivery_location', response.data)

    def test_validation_past_deadline(self):
        """16. Past deadline date/time raises validation error"""
        self.client.force_authenticate(user=self.buyer_1)
        payload = self.valid_payload.copy()
        payload['deadline'] = (timezone.now() - timedelta(days=1)).isoformat()
        response = self.client.post(self.rfq_list_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('deadline', response.data)

    def test_validation_invalid_status_value(self):
        """17. Invalid status string raises validation error"""
        self.client.force_authenticate(user=self.buyer_1)
        payload = self.valid_payload.copy()
        payload['status'] = 'EXPIRED'
        response = self.client.post(self.rfq_list_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.data)
