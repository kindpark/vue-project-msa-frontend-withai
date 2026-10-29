<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface OrderItem {
  orderId: number
  productId: number
  quantity: number
  totalPrice: number
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  shippingAddress: string
  createdAt: string
}

const orders = ref<OrderItem[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const fetchMyOrders = async () => {
  isLoading.value = true
  try {
    const res = await axios.get('/api/v1/orders/me')
    orders.value = res.data
  } catch (error: any) {
    console.error('주문 내역 조회 실패:', error)
    errorMessage.value = '주문 내역을 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchMyOrders()
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PAID':
      return '결제 완료'
    case 'PENDING':
      return '결제 대기'
    case 'CANCELLED':
      return '주문 취소'
    default:
      return status
  }
}
</script>

<template>
  <div class="mypage-container">
    <h2>마이페이지</h2>
    <p class="sub-title">최근 주문 내역</p>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-box">
      <div class="spinner"></div>
      <p>주문 내역을 불러오는 중...</p>
    </div>

    <!-- 에러 발생 -->
    <div v-else-if="errorMessage" class="error-box">
      <p>{{ errorMessage }}</p>
      <button class="retry-btn" @click="fetchMyOrders">다시 시도</button>
    </div>

    <!-- 주문 목록 없음 -->
    <div v-else-if="orders.length === 0" class="empty-box">
      <p>주문한 내역이 없습니다.</p>
    </div>

    <!-- 주문 목록 리스트 -->
    <div v-else class="order-list">
      <div v-for="order in orders" :key="order.orderId" class="order-card">
        <div class="card-header">
          <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          <span class="status-badge" :class="order.status.toLowerCase()">
            {{ getStatusLabel(order.status) }}
          </span>
        </div>

        <div class="card-body">
          <p class="order-id">주문번호: #{{ order.orderId }}</p>
          <p class="product-info">
            <span>상품 ID: {{ order.productId }}</span> | <span>수량: {{ order.quantity }}개</span>
          </p>
          <p class="address">배송지: {{ order.shippingAddress }}</p>
          <p class="total-price">
            총 결제금액: <strong>{{ order.totalPrice.toLocaleString() }}원</strong>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mypage-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  background-color: #ffffff;
}
h2 {
  font-size: 24px;
  margin-bottom: 6px;
}
.sub-title {
  color: #666;
  font-size: 14px;
  margin-bottom: 24px;
}
.loading-box, .error-box, .empty-box {
  text-align: center;
  padding: 60px 0;
  color: #888;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3182f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.order-card {
  border: 1px solid #e5e8eb;
  border-radius: 10px;
  padding: 18px;
  background-color: #fff;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f2f4f6;
}
.order-date {
  font-size: 13px;
  color: #8b95a1;
}
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}
.status-badge.paid {
  background-color: #e8f3ff;
  color: #3182f6;
}
.status-badge.pending {
  background-color: #fff8e1;
  color: #f57c00;
}
.status-badge.cancelled {
  background-color: #ffebee;
  color: #e53935;
}
.card-body p {
  margin: 4px 0;
  font-size: 14px;
  color: #4e5968;
}
.order-id {
  font-weight: 600;
  color: #333 !important;
}
.address {
  font-size: 13px;
  color: #8b95a1 !important;
}
.total-price {
  margin-top: 10px !important;
  font-size: 15px !important;
  color: #191f28 !important;
}
.total-price strong {
  color: #e53935;
}
.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #3182f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
