<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const router = useRouter()
//탭, 모달 제어용 반응형 변수 선언
const activeTab = ref<'id' | 'password'>('id')
const showModal = ref(false) // 1) 모달 표시 여부
const generatedTempPassword = ref('') // 2) 생성된 임시 비밀번호
// 아이디 찾기 폼 데이터
const findIdName = ref('')
const foundEmail = ref('')

// 비밀번호 찾기 폼 데이터
const findPwEmail = ref('')
const findPwName = ref('')
const isPwResetSuccess = ref(false)

const isLoading = ref(false)
const errorMessage = ref('')

// 아이디 찾기 요청
const handleFindId = async () => {
  errorMessage.value = ''
  foundEmail.value = ''
  if (!findIdName.value.trim()) {
    errorMessage.value = '이름을 입력해 주세요.'
    return
  }

  try {
    isLoading.value = true
    const res = await axios.post('/api/v1/users/find-id', { name: findIdName.value })
    foundEmail.value = res.data.email
  } catch {
    errorMessage.value = '일치하는 사용자 정보를 찾을 수 없습니다.'
  } finally {
    isLoading.value = false
  }
}

// 비밀번호 찾기 요청
const handleFindPassword = async () => {
  errorMessage.value = ''
  isPwResetSuccess.value = false
  if (!findPwEmail.value.trim() || !findPwName.value.trim()) {
    errorMessage.value = '이메일과 이름을 모두 입력해 주세요.'
    return
  }

  try {
    isLoading.value = true
    await axios.post('/api/v1/users/find-password', {
      email: findPwEmail.value,
      name: findPwName.value
    })
    isPwResetSuccess.value = true
  } catch {
    errorMessage.value = '입력하신 정보와 일치하는 계정이 없습니다.'
  } finally {
    isLoading.value = false
  }
}
// 3) 클립보드 복사 함수
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedTempPassword.value)
    alert('임시 비밀번호가 클립보드에 복사되었습니다!')
  } catch {
    alert('복사 실패: 직접 드래그해서 복사해 주세요.')
  }
}

// 4) 로그인 페이지 이동 함수
const goToLogin = () => {
  showModal.value = false
  router.push('/login')
}
</script>

<template>
  <div class="find-container">
    <div class="find-card">
      <div class="tab-header">
        <button
          :class="{ active: activeTab === 'id' }"
          @click="activeTab = 'id'; errorMessage = ''"
        >
          아이디 찾기
        </button>
        <button
          :class="{ active: activeTab === 'password' }"
          @click="activeTab = 'password'; errorMessage = ''"
        >
          비밀번호 찾기
        </button>
      </div>

      <!-- 아이디 찾기 탭 -->
      <div v-if="activeTab === 'id'" class="tab-content">
        <form @submit.prevent="handleFindId">
          <div class="form-group">
            <label for="findIdName">이름</label>
            <input
              id="findIdName"
              v-model="findIdName"
              type="text"
              placeholder="가입 시 등록한 이름 입력"
              required
            />
          </div>

          <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

          <div v-if="foundEmail" class="result-box">
            <span>회원님의 이메일 계정:</span>
            <strong>{{ foundEmail }}</strong>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            {{ isLoading ? '조회 중...' : '아이디 찾기' }}
          </button>
        </form>
      </div>

      <!-- 비밀번호 찾기 탭 -->
      <div v-else class="tab-content">
        <form @submit.prevent="handleFindPassword">
          <div class="form-group">
            <label for="findPwEmail">이메일</label>
            <input
              id="findPwEmail"
              v-model="findPwEmail"
              type="email"
              placeholder="example@domain.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="findPwName">이름</label>
            <input
              id="findPwName"
              v-model="findPwName"
              type="text"
              placeholder="가입 시 등록한 이름 입력"
              required
            />
          </div>

          <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

          <div v-if="isPwResetSuccess" class="result-box success">
            임시 비밀번호(또는 안내 메일)가 전송되었습니다.
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            {{ isLoading ? '처리 중...' : '비밀번호 찾기' }}
          </button>
        </form>
      </div>

      <div class="footer-links">
        <router-link to="/login">로그인으로 돌아가기</router-link>
      </div>
      <!-- FindAccountView.vue 모달 템플릿 부분 -->
<div v-if="showModal" class="modal-overlay">
  <div class="modal-content">
    <h3>비밀번호 재설정 완료</h3>
    <p>임시 비밀번호가 발급되었습니다.</p>
    <div class="temp-pw-box">
      <strong>{{ generatedTempPassword }}</strong>
      <button @click="copyToClipboard">복사</button>
    </div>
    <p class="notice">로그인 후 반드시 비밀번호를 변경해 주세요.</p>
    <button class="close-btn" @click="goToLogin">로그인하러 가기</button>
  </div>
</div>
    </div>
  </div>
</template>

<style scoped>
.find-container { display: flex; justify-content: center; align-items: center; min-height: 70vh; padding: 20px; }
.find-card { width: 100%; max-width: 400px; padding: 30px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #fff; text-align: left; }
.tab-header { display: flex; border-bottom: 2px solid #eee; margin-bottom: 20px; }
.tab-header button { flex: 1; padding: 12px; background: none; border: none; font-size: 16px; font-weight: bold; color: #888; cursor: pointer; }
.tab-header button.active { color: #35495e; border-bottom: 2px solid #35495e; margin-bottom: -2px; }
.form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
.form-group label { font-size: 14px; margin-bottom: 6px; color: #666; }
.form-group input { padding: 10px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; }
.error-msg { color: #e53935; font-size: 14px; margin-bottom: 12px; text-align: center; }
.result-box { margin: 16px 0; padding: 12px; background-color: #f5f5f5; border-radius: 4px; text-align: center; word-break: break-all; }
.result-box.success { background-color: #e8f5e9; color: #2e7d32; }
.result-box strong { display: block; margin-top: 4px; color: #35495e; font-size: 16px; }
.submit-btn { width: 100%; padding: 12px; background-color: #35495e; color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; }
.submit-btn:disabled { background-color: #aaa; cursor: not-allowed; }
.footer-links { margin-top: 20px; text-align: center; font-size: 14px; }
.footer-links a { color: #41b883; text-decoration: none; font-weight: bold; }
/* 화면 전체를 어둡게 덮는 배경 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 중앙 모달 대화상자 */
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 350px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.temp-pw-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f5f5;
  padding: 10px 15px;
  border-radius: 4px;
  margin: 15px 0;
}

.temp-pw-box strong {
  font-size: 18px;
  color: #e53935;
  letter-spacing: 1px;
}

.temp-pw-box button {
  padding: 5px 10px;
  background-color: #35495e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.notice {
  font-size: 12px;
  color: #888;
  margin-bottom: 20px;
}

.close-btn {
  width: 100%;
  padding: 10px;
  background-color: #41b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
</style>
