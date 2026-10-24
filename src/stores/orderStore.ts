import { defineStore } from 'pinia';
import { ref } from 'vue';

interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  thumbnailUrl?: string;
}

export const useOrderStore = defineStore('order', () => {
  const currentOrder = ref<OrderItem | null>(null);

  // 바로 구매 클릭 시 주문 데이터 임시 저장
  const setOrder = (item: OrderItem) => {
    currentOrder.value = item;
  };

  // 결제 완료/취소 시 스토어 초기화
  const clearOrder = () => {
    currentOrder.value = null;
  };

  return { currentOrder, setOrder, clearOrder };
});
