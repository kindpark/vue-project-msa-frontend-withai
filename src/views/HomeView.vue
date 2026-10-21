<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

// 1. 상품 객체 타입 정의 (never 에러 원천 차단)
interface Product {
  id: number | string
  name: string
  price: number
  thumbnailUrl?: string
}

const router = useRouter()
const products = ref<Product[]>([])
const isLoading = ref(true)

const fetchProducts = async () => {
  try {
    const res = await axios.get('/api/v1/products')
    products.value = res.data
  } catch (err) {
    console.error('상품 목록 조회 실패:', err)
  } finally {
    isLoading.value = false
  }
}

const goToDetail = (productId: number | string) => {
  router.push(`/products/${productId}`)
}

onMounted(fetchProducts)
</script>

<template>
  <div class="container">
    <h1>홈쇼핑 상품 목록</h1>
    <div v-if="isLoading" class="loading">상품을 불러오는 중...</div>
    <div v-else class="product-grid">
      <div
        v-for="product in products"
        :key="product.id"
        class="card"
        @click="goToDetail(product.id)"
      >
        <img :src="product.thumbnailUrl || 'https://via.placeholder.com/200'" alt="상품 이미지" />
        <div class="info">
          <h3>{{ product.name }}</h3>
          <p class="price">{{ product.price?.toLocaleString() }}원</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container { max-width: 1000px; margin: 0 auto; padding: 20px; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
.card { border: 1px solid #eee; border-radius: 8px; overflow: hidden; cursor: pointer; transition: transform 0.2s; }
.card:hover { transform: translateY(-5px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.card img { width: 100%; height: 180px; object-fit: cover; }
.info { padding: 12px; }
.price { font-weight: bold; color: #e53935; margin-top: 8px; }
</style>
