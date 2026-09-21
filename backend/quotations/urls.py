from django.urls import path
from .views import RFQQuotationListCreateView, MyQuotationsListView

urlpatterns = [
    path('rfqs/<int:rfq_id>/quotations/', RFQQuotationListCreateView.as_view(), name='rfq_quotations_list_create'),
    path('quotations/my/', MyQuotationsListView.as_view(), name='my_quotations_list'),
]
