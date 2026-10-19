<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  try {
    const res = await axios.post('/api/v1/users/login', {
      email: email.value,
      password: password.value
    })

    // 백엔드에서 받은 JWT 토큰을 로컬스토리지에 저장
    localStorage.setItem('accessToken', res.data.accessToken)
    alert('로그인 성공했습니다!')
    router.push('/')
  } catch (err) {
    alert('로그인 실패: ' + (err.response?.data?.message || '이메일 또는 비밀번호를 확인하세요.'))
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container">
    <h2>로그인</h2>
    <form @submit.prevent="handleLogin" class="form">
      <div class="input-group">
        <label>이메일</label>
        <input v-model="email" type="email" placeholder="email@example.com" required />
      </div>
      <div class="input-group">
        <label>비밀번호</label>
        <input v-model="password" type="password" placeholder="비밀번호 입력" required />
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? '로그인 중...' : '로그인' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.container { max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
.form { display: flex; flex-direction: column; gap: 15px; }
.input-group { display: flex; flex-direction: column; text-align: left; }
input { padding: 10px; border: 1px solid #ccc; border-radius: 4px; margin-top: 5px; }
button { padding: 12px; background-color: #42b883; color: white; border: none; border-radius: 4px; cursor: pointer; }
button:disabled { background-color: #aaa; }
</style>
