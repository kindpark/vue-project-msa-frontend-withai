<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orderStore'
import { loadTossPayments } from '@tosspayments/payment-sdk'
import axios from 'axios'

import AddressForm from '@/components/AddressForm.vue'
import PaymentMethod from '@/components/PaymentMethod.vue'

const router = useRouter()
const orderStore = useOrderStore()

const shippingAddress = ref('')
const selectedMethod = ref('CARD') // 'CARD' | 'KAKAO'
const isProcessing = ref(false)

// 토스 공식 공용 테스트 클라이언트 키
const clientKey = 'test_ck_pP2YxJ4K87RqLjzApvRWrRGZwXLO'

onMounted(() => {
  // Pinia 스토어에서 주문 정보가 없으면 홈으로 이동 (Query String 미사용)
  if (!orderStore.currentOrder) {
    alert('잘못된 접근이거나 주문 정보가 존재하지 않습니다.')
    router.push('/')
  }
})

const handlePayment = async () => {
  const order = orderStore.currentOrder
  if (!order) {
    alert('주문 정보가 없습니다.')
    return
  }

  if (!shippingAddress.value.trim()) {
    alert('배송지 주소를 입력해 주세요.')
    return
  }

  isProcessing.value = true

  try {
    // 1. Order Service 주문 PENDING 생성 & 재고 임시 선점 요청
    const prepareRes = await axios.post('/api/v1/orders/prepare', {
      userId: 1, // JWT 토큰 적용 시 유저 식별값
      productId: order.productId,
      quantity: order.quantity,
      totalPrice: order.price * order.quantity,
      shippingAddress: shippingAddress.value
    })

    const merchantOrderId = prepareRes.data.orderId

    // 2. 토스페이먼츠 SDK 호출
    const tossPayments = await loadTossPayments(clientKey)
    //const payMethodName = selectedMethod.value === 'KAKAO' ? '카카오페이' : '카드'
    // 3. 결제 요청 파라미터 구성
    const paymentOptions: Record<string, any> = {
      amount: order.price * order.quantity,
      orderId: `order_${merchantOrderId}_${Date.now()}`,
      orderName: order.productName,
      successUrl: `${window.location.origin}/payments/success?orderId=${merchantOrderId}&method=${selectedMethod.value}`,
      failUrl: `${window.location.origin}/checkout`
    }

    // 카카오페이 선택 시 DIRECT 옵션과 easyPay 지정
    if (selectedMethod.value === 'KAKAO') {
      paymentOptions.flowMode = 'DIRECT'
      paymentOptions.easyPay = '카카오페이'
    }
    // requestPayment 첫 번째 인자는 항상 타입 규칙에 맞게 '카드' 전달
    await tossPayments.requestPayment('카드',{
      amount: order.price * order.quantity,
      orderId: `ordr_${merchantOrderId}_${Date.now()}`,
      orderName: order.productName,
      successUrl: `${window.location.origin}/payments/success?orderId=${merchantOrderId}&method=${selectedMethod.value}`,
  failUrl: `${window.location.origin}/payments/fail` // 실패/취소 시 fail 페이지로 이동
    })

  } catch (error: any) {
    if (error.code === 'USER_CANCEL') {
      alert('결제를 취소하셨습니다.')
    } else {
      alert(`결제 처리 중 오류 발생: ${error.response?.data?.error || error.message || error}`)
    }
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="container" v-if="orderStore.currentOrder">
    <h2>주문 / 결제</h2>

    <!-- 주문 상품 요약 -->
    <div class="order-summary">
      <h3>주문 상품 정보</h3>
      <div class="product-info">
        <p><strong>상품명:</strong> {{ orderStore.currentOrder.productName }}</p>
        <p><strong>수량:</strong> {{ orderStore.currentOrder.quantity }}개</p>
        <p>
          <strong>총 결제금액:</strong>
          <span class="total-price">
            {{ (orderStore.currentOrder.price * orderStore.currentOrder.quantity).toLocaleString() }}원
          </span>
        </p>
      </div>
    </div>

    <!-- 배송지 입력 자식 컴포넌트 -->
    <AddressForm v-model="shippingAddress" />

    <!-- 결제 수단 선택 자식 컴포넌트 -->
    <PaymentMethod v-model="selectedMethod" />

    <!-- 결제 진행 버튼 -->
    <button
      class="pay-btn"
      :disabled="isProcessing"
      @click="handlePayment"
    >
      {{ isProcessing ? '재고 선점 및 결제 진행 중...' : `${(orderStore.currentOrder.price * orderStore.currentOrder.quantity).toLocaleString()}원 결제하기` }}
    </button>
  </div>
</template>

<style scoped>
.container {
  max-width: 500px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: left;
  background-color: #ffffff;
}
h2 {
  margin-bottom: 20px;
  font-size: 22px;
}
.order-summary {
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 20px;
}
.order-summary h3 {
  font-size: 15px;
  margin-bottom: 8px;
  color: #333;
}
.product-info p {
  margin: 4px 0;
  font-size: 14px;
}
.total-price {
  color: #e53935;
  font-weight: bold;
  font-size: 18px;
  margin-left: 6px;
}
.pay-btn {
  width: 100%;
  padding: 15px;
  background-color: #3182f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
}
.pay-btn:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
</style>
