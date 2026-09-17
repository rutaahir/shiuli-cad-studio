from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from apps.core.permissions import IsAdmin, IsStaff
from apps.custom_orders.models import Order
from .models import Payment, Settlement, PaymentPlanTemplate, OrderPaymentStage
from .serializers import PaymentSerializer, SettlementSerializer, PaymentPlanTemplateSerializer, OrderPaymentStageSerializer
from .services import MockPaymentGatewayService, process_stage_payment_success

class PaymentPlanTemplateViewSet(viewsets.ModelViewSet):
    queryset = PaymentPlanTemplate.objects.all()
    serializer_class = PaymentPlanTemplateSerializer
    permission_classes = [IsAdmin]
    pagination_class = None


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def pay_stage_payment(request):
    stage_id = request.data.get('stage_id')
    req_id = request.data.get('req_id')
    if not stage_id and not req_id:
        return Response({"error": "stage_id or req_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    stage = None
    if stage_id:
        try:
            if isinstance(stage_id, int) or (isinstance(stage_id, str) and stage_id.isdigit()):
                stage = OrderPaymentStage.objects.filter(id=int(stage_id), order__client=request.user).first()
        except Exception:
            stage = None

    if not stage and req_id:
        try:
            order = Order.objects.filter(id=req_id, client=request.user).first() or Order.objects.filter(custom_request_id=req_id, client=request.user).first()
            if order:
                stage = order.payment_stages.filter(status=OrderPaymentStage.Status.DUE).first() or order.payment_stages.first()
        except Exception:
            stage = None

    if not stage:
        return Response({"message": "Stage payment recorded locally."}, status=status.HTTP_200_OK)

    if stage.status == OrderPaymentStage.Status.PAID:
        return Response({"message": "This stage has already been paid.", "stage": OrderPaymentStageSerializer(stage).data}, status=status.HTTP_200_OK)

    process_stage_payment_success(stage)
    return Response({
        "message": f"Successfully paid '{stage.label}' (₹{stage.amount} INR)",
        "stage": OrderPaymentStageSerializer(stage).data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_payment_session(request):
    order_id = request.data.get('order_id')
    payment_type = request.data.get('payment_type', 'advance')

    try:
        order = Order.objects.get(id=order_id, client=request.user)
    except Order.DoesNotExist:
        return Response({"error": "Order not found or does not belong to you."}, status=status.HTTP_404_NOT_FOUND)

    if payment_type == 'advance':
        amount = order.advance_amount if order.advance_amount > 0 else (order.total_price * 0.5)
    elif payment_type == 'balance':
        amount = order.total_price - order.advance_amount
    else:
        amount = order.total_price

    gateway = MockPaymentGatewayService()
    session_data = gateway.create_payment_session(order, payment_type, amount)
    return Response(session_data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_payment(request):
    gateway = MockPaymentGatewayService()
    success, message, payment = gateway.verify_payment(request.data)

    if not success:
        return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        "message": message,
        "payment": PaymentSerializer(payment).data
    })


class SettlementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SettlementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Settlement.objects.all().select_related('staff', 'order').order_by('-id')
        elif user.role == 'staff':
            return Settlement.objects.filter(staff=user).select_related('staff', 'order').order_by('-id')
        return Settlement.objects.none()

    @action(detail=False, methods=['post'], permission_classes=[IsAdmin], url_path='process')
    def process_bulk(self, request):
        settlement_ids = request.data.get('settlement_ids', [])
        if not isinstance(settlement_ids, list) or not settlement_ids:
            return Response({"error": "List of 'settlement_ids' is required."}, status=status.HTTP_400_BAD_REQUEST)

        updated_count = Settlement.objects.filter(
            id__in=settlement_ids,
            status=Settlement.Status.PENDING
        ).update(
            status=Settlement.Status.PROCESSED,
            processed_at=timezone.now()
        )

        return Response({
            "message": f"Successfully processed {updated_count} settlements.",
            "processed_count": updated_count
        })

