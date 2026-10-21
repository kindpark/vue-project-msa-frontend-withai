<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

// 1. Q&A 객체 타입 정의
interface QnaItem {
  id: number
  content: string
  answer?: string | null
}

// 2. never[] 대신 QnaItem[] 제네릭 명시
const qnaList = ref<QnaItem[]>([])
const newContent = ref('')

const fetchQna = async () => {
  try {
    const res = await axios.get('/api/v1/qna')
    qnaList.value = res.data
  } catch (err) {
    console.error('Q&A 로드 실패:', err)
  }
}

const submitQna = async () => {
  if (!newContent.value.trim()) return

  try {
    const token = localStorage.getItem('accessToken')
    await axios.post('/api/v1/qna', {
      content: newContent.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    newContent.value = ''
    alert('문의가 등록되었습니다.')
    fetchQna()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    alert('문의 등록 실패: 로그인 상태를 확인해 주세요.')
  }
}

onMounted(fetchQna)
</script>

<template>
  <div class="container">
    <h2>상품 문의 & 상담</h2>

    <div class="write-box">
      <textarea v-model="newContent" placeholder="문의하실 내용을 입력하세요" rows="4"></textarea>
      <button @click="submitQna">문의 등록</button>
    </div>

    <div class="qna-list">
      <h3>문의 리스트</h3>
      <div v-for="item in qnaList" :key="item.id" class="qna-card">
        <p class="question"><strong>Q.</strong> {{ item.content }}</p>
        <p class="answer" v-if="item.answer"><strong>A.</strong> {{ item.answer }}</p>
        <p class="answer pending" v-else><em>답변 대기 중입니다.</em></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container { max-width: 700px; margin: 40px auto; padding: 20px; text-align: left; }
.write-box { display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px; }
textarea { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
button { align-self: flex-end; padding: 10px 20px; background-color: #42b883; color: white; border: none; border-radius: 4px; cursor: pointer; }
.qna-card { border-bottom: 1px solid #eee; padding: 15px 0; }
.question { font-size: 16px; margin: 0 0 8px 0; }
.answer { font-size: 15px; color: #555; margin: 0; background: #f9f9f9; padding: 10px; border-radius: 4px; }
.pending { color: #999; }
</style>
