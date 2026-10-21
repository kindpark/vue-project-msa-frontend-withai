<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadTossPayments } from '@tosspayments/payment-sdk'
import axios from 'axios'

interface Product {
  id: number
  name: string
  price: number
}

const route = useRoute()
const router = useRouter()

const product = ref<Product|null>(null)

const address = ref('')
const isProcessing = ref(false)

// 토스 공식 공용 테스트 클라이언트 키
const clientKey = 'test_ck_pP2YxJ4K87RqLjzApvRWrRGZwXLO'

onMounted(async () => {
  const productId = route.query.productId
  if (!productId) {
    alert('잘못된 접근입니다.')
    router.push('/');
    return;
  }
    try {
      const res = await axios.get(`/api/v1/products/${productId}`)
      product.value = res.data
    } catch (err) {
      console.warn('기본 테스트 상품 정보로 진행합니다.')
          product.value = {
      id: Number(productId),
      name: '테스트 상품',
      price: 15000
    }
    }
  }
)

const handlePayment = async () => {
  // 상단에서 null 체크가 안 되어 있을 수 있으므로 방어 코드 추가
  if (!product.value) {
    alert('상품 정보가 없습니다.')
    return
  }
    if (!address.value.trim()) {
    alert('배송지 주소를 입력해 주세요.')
    return
  }

  isProcessing.value = true

  try {
    // 1. SDK 로드 및 인스턴스 생성
    const tossPayments = await loadTossPayments(clientKey)

    // 2. 결제 요청 실행
    await tossPayments.requestPayment('카드', {
      amount: product.value.price,
      orderId: `order_${new Date().getTime()}`,
      orderName: product.value.name,
      customerName: '구매자',
      successUrl: `${window.location.origin}/mypage`,
      failUrl: `${window.location.origin}/checkout`
    })
  } catch (error: any) {
    if (error.code === 'USER_CANCEL') {
      alert('결제를 취소하셨습니다.')
    } else {
      alert(`결제 실패: ${error.message || error}`)
    }
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="container" v-if="product">
    <h2>주문 / 결제 (토스페이먼츠 SDK)</h2>
    <div class="order-summary">
      <h3>주문 상품 정보</h3>
      <p>상품명: {{ product.name }}</p>
      <p>결제 금액: <strong>{{ product.price?.toLocaleString() }}원</strong></p>
    </div>

    <div class="form">
      <h3>배송 정보</h3>
      <input v-model="address" type="text" placeholder="배송지 주소를 입력하세요" class="input-field" />

      <button class="pay-btn" :disabled="isProcessing" @click="handlePayment">
        {{ isProcessing ? '결제 진행 중...' : `${product.price?.toLocaleString()}원 토스 결제하기` }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.container { max-width: 500px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; text-align: left; }
.order-summary { background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
.input-field { width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
.pay-btn { width: 100%; padding: 15px; background-color: #3182f6; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
.pay-btn:disabled { background-color: #aaa; cursor: not-allowed; }
</style>
