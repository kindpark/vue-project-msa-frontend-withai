<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

//상품 데이터 구조 정의
interface Product{
  id: number | string;
  name: string;
  price: number;
  description?: string;
  thumbnailUrl?: string;
  quantity: number;
}
const route = useRoute()
const router = useRouter()
//null 혹은 Product 타입이 들어올수 있다고 명시하여 'never 에러 방지'
const product = ref<Product | null>(null)
const stockQuantity = ref(0)
const isLoading = ref(true)

const loadData = async () => {
  const productId = route.params.id
  try {


    const res = await axios.get(`/api/v1/products/${productId}`);
    product.value = res.data
    stockQuantity.value = res.data.quantity
  } catch {
    alert('상품 정보를 가져오지 못했습니다.')
  } finally {
    isLoading.value = false
  }
}

const goToCheckout = () => {
  if(!product.value) return
  router.push({
    path: '/checkout',
    query: { productId: product.value?.id }
  })
}

onMounted(loadData)
</script>

<template>
  <div class="container" v-if="!isLoading && product">
    <div class="detail-wrapper">
      <img :src="product.thumbnailUrl || 'https://via.placeholder.com/400'" class="main-img" />
      <div class="content">
        <h2>{{ product.name }}</h2>
        <p class="price">{{ product.price?.toLocaleString() }}원</p>
        <p class="description">{{ product.description }}</p>

        <div class="stock-info">
          <span>남은 재고: </span>
          <strong :class="{ 'out-of-stock': stockQuantity === 0 }">
            {{ stockQuantity > 0 ? stockQuantity + '개' : '품절' }}
          </strong>
        </div>

        
        <button
          class="buy-btn"
          :disabled="stockQuantity <= 0"
          @click="goToCheckout"
        >
          {{ stockQuantity > 0 ? '구매하러 가기' : '품절되었습니다' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container { max-width: 800px; margin: 40px auto; padding: 20px; }
.detail-wrapper { display: flex; gap: 40px; }
.main-img { width: 350px; height: 350px; object-fit: cover; border-radius: 8px; }
.content { flex: 1; text-align: left; }
.price { font-size: 24px; color: #e53935; font-weight: bold; }
.stock-info { margin: 20px 0; font-size: 16px; }
.out-of-stock { color: #d32f2f; }
.buy-btn { width: 100%; padding: 15px; background-color: #35495e; color: white; border: none; border-radius: 4px; font-size: 18px; cursor: pointer; }
.buy-btn:disabled { background-color: #ccc; cursor: not-allowed; }
</style>
