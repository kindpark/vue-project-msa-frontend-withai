<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')

const isLoading = ref(false)
const errorMessage = ref('')

const handleChangePassword = async () => {
  errorMessage.value = ''

  if (!currentPassword.value || !newPassword.value) {
    errorMessage.value = '모든 필드를 입력해 주세요.'
    return
  }

  if (newPassword.value !== newPasswordConfirm.value) {
    errorMessage.value = '새 비밀번호가 일치하지 않습니다.'
    return
  }

  if (currentPassword.value === newPassword.value) {
    errorMessage.value = '현재 비밀번호와 다른 새 비밀번호를 입력해 주세요.'
    return
  }

  try {
    isLoading.value = true
    const token = localStorage.getItem('accessToken')

    await axios.patch('/api/v1/users/password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해 주세요.')

    // 토큰 삭제 후 로그인 페이지로 이동
    localStorage.removeItem('accessToken')
    router.push('/login')
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      errorMessage.value = err.response.data.message
    } else {
      errorMessage.value = '비밀번호 변경 중 오류가 발생했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="change-pw-container">
    <div class="change-pw-card">
      <h2>비밀번호 변경</h2>

      <form @submit.prevent="handleChangePassword">
        <div class="form-group">
          <label for="currentPw">현재 비밀번호</label>
          <input
            id="currentPw"
            v-model="currentPassword"
            type="password"
            placeholder="현재 비밀번호 입력"
            required
          />
        </div>

        <div class="form-group">
          <label for="newPw">새 비밀번호</label>
          <input
            id="newPw"
            v-model="newPassword"
            type="password"
            placeholder="새 비밀번호 입력"
            required
          />
        </div>

        <div class="form-group">
          <label for="newPwConfirm">새 비밀번호 확인</label>
          <input
            id="newPwConfirm"
            v-model="newPasswordConfirm"
            type="password"
            placeholder="새 비밀번호 재입력"
            required
          />
        </div>

        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? '변경 중...' : '비밀번호 변경' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.change-pw-container { display: flex; justify-content: center; align-items: center; min-height: 70vh; padding: 20px; }
.change-pw-card { width: 100%; max-width: 400px; padding: 30px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #fff; text-align: left; }
h2 { text-align: center; margin-bottom: 24px; color: #333; }
.form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
.form-group label { font-size: 14px; margin-bottom: 6px; color: #666; }
.form-group input { padding: 10px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; }
.error-msg { color: #e53935; font-size: 14px; margin-bottom: 12px; text-align: center; }
.submit-btn { width: 100%; padding: 12px; background-color: #35495e; color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; }
.submit-btn:disabled { background-color: #aaa; cursor: not-allowed; }
</style>
