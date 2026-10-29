<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 토스페이먼츠 또는 URL 쿼리 스트링에서 에러 정보 수집
const errorCode = computed(() => (route.query.code as string) || 'UNKNOWN_ERROR')
const errorMessage = computed(
  () => (route.query.message as string) || '결제 진행 중 알 수 없는 오류가 발생했습니다.'
)

const goToCheckout = () => {
  router.push('/checkout')
}

const goToHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="fail-container">
    <div class="state-box fail">
      <div class="icon-wrapper">
        <span>⚠️</span>
      </div>
      <h2>결제에 실패하였습니다</h2>
      <p class="error-msg">{{ errorMessage }}</p>
      <p class="error-code">오류 코드: {{ errorCode }}</p>

      <div class="notice">
        <p>선점되었던 상품 재고는 자동으로 원복되었습니다.</p>
      </div>

      <div class="btn-group">
        <button class="btn retry-btn" @click="goToCheckout">다시 결제하기</button>
        <button class="btn home-btn" @click="goToHome">메인으로 돌아가기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fail-container {
  max-width: 500px;
  margin: 80px auto;
  padding: 30px;
  border: 1px solid #eee;
  border-radius: 12px;
  text-align: center;
  background-color: #fff;
}
.icon-wrapper {
  font-size: 48px;
  margin-bottom: 12px;
}
.state-box h2 {
  font-size: 22px;
  margin-bottom: 12px;
  color: #333;
}
.error-msg {
  color: #e53935;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 6px;
}
.error-code {
  color: #888;
  font-size: 13px;
  margin-bottom: 20px;
}
.notice {
  background-color: #fff8e1;
  border: 1px solid #ffe082;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 24px;
  font-size: 13px;
  color: #795548;
}
.btn-group {
  display: flex;
  gap: 12px;
}
.btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
}
.retry-btn {
  background-color: #3182f6;
  color: white;
}
.home-btn {
  background-color: #f2f4f6;
  color: #4e5968;
}
</style>
