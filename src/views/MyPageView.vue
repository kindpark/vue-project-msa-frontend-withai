<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
// 1. 주문 데이터 구조 정의 (never 에러 방지)
interface Order {
  id: number | string;
  status: string;
  shippingAddress: string;
  totalPrice: number;
}
const orders = ref<Order[]>([]);
const isLoading = ref(true);

const fetchMyOrders = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await axios.get("/api/v1/orders/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    orders.value = res.data;
  } catch (err) {
    console.error("주문 내역 로드 실패:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchMyOrders);
</script>

<template>
  <div class="container">
    <h2>내 주문 내역</h2>
    <div v-if="isLoading">로딩 중...</div>
    <div v-else-if="orders.length === 0">주문한 내역이 없습니다.</div>
    <ul v-else class="order-list">
      <li v-for="order in orders" :key="order.id" class="order-item">
        <div class="header">
          <span>주문번호: #{{ order.id }}</span>
          <span class="status">{{ order.status }}</span>
        </div>
        <div class="body">
          <p>배송지: {{ order.shippingAddress }}</p>
          <p class="total">결제금액: {{ order.totalPrice?.toLocaleString() }}원</p>
        </div>
      </li>
    </ul>
  </div>
</template>


<style scoped>
.container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  text-align: left;
}
.order-list {
  list-style: none;
  padding: 0;
}
.order-item {
  border: 1px solid #eee;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 6px;
}
.header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}
.status {
  color: #2c3e50;
}
.total {
  font-weight: bold;
  color: #e53935;
  margin-top: 5px;
}
</style>
