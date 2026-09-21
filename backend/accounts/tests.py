from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthenticationAPITests(APITestCase):

    def setUp(self):
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.refresh_url = reverse('auth_refresh')
        self.me_url = reverse('auth_me')

        self.buyer_data = {
            'name': 'Buyer One',
            'email': 'buyer@example.com',
            'password': 'StrongPassword123!',
            'role': 'BUYER'
        }

        self.supplier_data = {
            'name': 'Supplier One',
            'email': 'supplier@example.com',
            'password': 'StrongPassword123!',
            'role': 'SUPPLIER'
        }

    def test_1_register_buyer(self):
        """1. Register Buyer test"""
        response = self.client.post(self.register_url, self.buyer_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['email'], 'buyer@example.com')
        self.assertEqual(response.data['user']['role'], 'BUYER')
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_2_register_supplier(self):
        """2. Register Supplier test"""
        response = self.client.post(self.register_url, self.supplier_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['email'], 'supplier@example.com')
        self.assertEqual(response.data['user']['role'], 'SUPPLIER')

    def test_3_login_buyer(self):
        """3. Login Buyer test"""
        # Register first
        self.client.post(self.register_url, self.buyer_data, format='json')

        # Attempt Login
        login_payload = {
            'email': 'buyer@example.com',
            'password': 'StrongPassword123!'
        }
        response = self.client.post(self.login_url, login_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], 'BUYER')

    def test_4_login_supplier(self):
        """4. Login Supplier test"""
        # Register first
        self.client.post(self.register_url, self.supplier_data, format='json')

        # Attempt Login
        login_payload = {
            'email': 'supplier@example.com',
            'password': 'StrongPassword123!'
        }
        response = self.client.post(self.login_url, login_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['role'], 'SUPPLIER')

    def test_5_invalid_login(self):
        """5. Invalid login test"""
        self.client.post(self.register_url, self.buyer_data, format='json')

        # Wrong password
        response = self.client.post(self.login_url, {
            'email': 'buyer@example.com',
            'password': 'WrongPassword999'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Non-existent email
        response = self.client.post(self.login_url, {
            'email': 'nobody@example.com',
            'password': 'StrongPassword123!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_6_get_current_user(self):
        """6. Get current user test with Bearer token"""
        reg_resp = self.client.post(self.register_url, self.buyer_data, format='json')
        access_token = reg_resp.data['access']

        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'buyer@example.com')
        self.assertEqual(response.data['name'], 'Buyer One')
        self.assertEqual(response.data['role'], 'BUYER')

    def test_7_access_protected_endpoint_without_token(self):
        """7. Access protected endpoint without token test"""
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
