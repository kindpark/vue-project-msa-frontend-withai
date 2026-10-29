<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orderStore'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const isProcessing = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  // 토스페이먼츠에서 successUrl 뒤에 쿼리 스트링으로 전달해주는 값들
  const paymentKey = route.query.paymentKey as string
  const orderId = route.query.orderId as string // 형식: order_{merchantOrderId}_{timestamp}
  const amount = Number(route.query.amount)
  const method = (route.query.method as string) || 'CARD'

  // 백엔드 orders 테이블의 PK(id) 추출 (order_12_1699999 -> 12)
  let merchantOrderId: number | null = null
  if (orderId && orderId.startsWith('order_')) {
    const parts = orderId.split('_')
    merchantOrderId = Number(parts[1])
  }

  if (!paymentKey || !merchantOrderId || !amount) {
    errorMessage.value = '결제 승인 정보가 올바르지 않습니다.'
    isProcessing.value = false
    return
  }

  try {
    // 백엔드 Order & Payment Service 결제 최종 승인 요청
    // PG 승인 + PAID 상태 변경 + 재고 확정 차감 (실패 시 보상 트랜잭션)
    await axios.post('/api/v1/payments/confirm', {
      orderId: merchantOrderId,
      paymentKey: paymentKey,
      amount: amount,
      method: method
    })

    // 승인 성공 시 Pinia 임시 주문 상태 초기화
    orderStore.clearOrder()

    // 2초 후 마이페이지 주문 내역으로 이동
    setTimeout(() => {
      router.push('/mypage')
    }, 2000)

  } catch (error: any) {
    console.error('결제 승인 오류:', error)
    errorMessage.value = error.response?.data?.message || '결제 승인 처리 중 오류가 발생했습니다. (재고 선점이 해제되었습니다.)'
  } finally {
    isProcessing.value = false
  }
})
</script>

<template>
  <div class="result-container">
    <!-- 승인 처리 중 -->
    <div v-if="isProcessing" class="state-box">
      <div class="spinner"></div>
      <h2>결제 승인 및 주문을 완료하는 중입니다...</h2>
      <p>잠시만 기다려 주세요.</p>
    </div>

    <!-- 승인 성공 -->
    <div v-else-if="!errorMessage" class="state-box success">
      <h2>🎉 결제가 성공적으로 완료되었습니다!</h2>
      <p>주문 내역 페이지로 자동 이동합니다.</p>
      <button class="btn" @click="router.push('/mypage')">마이페이지로 이동</button>
    </div>

    <!-- 승인 실패 (보상 트랜잭션 실행됨) -->
    <div v-else class="state-box fail">
      <h2>⚠️ 결제 승인 실패</h2>
      <p class="error-msg">{{ errorMessage }}</p>
      <button class="btn retry-btn" @click="router.push('/checkout')">다시 시도하기</button>
    </div>
  </div>
</template>

<style scoped>
.result-container {
  max-width: 500px;
  margin: 80px auto;
  padding: 30px;
  border: 1px solid #eee;
  border-radius: 12px;
  text-align: center;
  background-color: #fff;
}
.state-box h2 {
  font-size: 20px;
  margin-bottom: 12px;
}
.error-msg {
  color: #e53935;
  margin-bottom: 20px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3182f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.btn {
  padding: 12px 24px;
  background-color: #3182f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
.retry-btn {
  background-color: #757575;
}
</style>
