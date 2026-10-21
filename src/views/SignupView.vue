<script setup lang="ts">
import { ref } from 'vue'
import {useRouter} from 'vue-router'
import axios from 'axios'

const router = useRouter()

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const name = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleSignup= async ()=>{
  errorMessage.value=''

  //유효성 검사하는 부분
  if(!email.value || !password.value || !name.value){
    errorMessage.value = '모든 필드를 입력해주세요.'
    return
  }
  //비밀번호 재입력시 일치하지 않는다면
  if(password.value !== passwordConfirm.value){
    errorMessage.value='비밀번호가 일치하지 않습니다.'
    return
  }
  try{
    isLoading.value=true
    //회원가입 API 호출
    await axios.post('/api/v1/users/signup', {
      email: email.value,
      password: password.value,
      name: name.value
    })
    alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.')
    router.push('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }catch(err: any){
    //회원가입 실패 원인 디버거
    console.error('회원가입 실패: ', err)
    if(err.response && err.response.data && err.response.data.message){
      errorMessage.value = err.response.data.message
    }else{
      errorMessage.value = '회원가입 처리 중 오류가 발생하였습니다.'
    }
  }finally{
    isLoading.value=false;
  }
}
</script>
<template>
  <div class="signup-container">
    <div class="signup-card">
      <h2>회원가입</h2>

      <form @submit.prevent="handleSignup">
        <div class="form-group">
          <label for="email">이메일</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="example@domain.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="name">이름</label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="홍길동"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="비밀번호 입력"
            required
          />
        </div>

        <div class="form-group">
          <label for="passwordConfirm">비밀번호 확인</label>
          <input
            id="passwordConfirm"
            v-model="passwordConfirm"
            type="password"
            placeholder="비밀번호 재입력"
            required
          />
        </div>

        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

        <button type="submit" class="signup-btn" :disabled="isLoading">
          {{ isLoading ? '가입 처리 중...' : '회원가입' }}
        </button>
      </form>

      <div class="footer-links">
        <span>이미 계정이 있으신가요?</span>
        <router-link to="/login">로그인하기</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.signup-card {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  text-align: left;
}

.form-group label {
  font-size: 14px;
  margin-bottom: 6px;
  color: #666;
}

.form-group input {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #35495e;
}

.error-msg {
  color: #e53935;
  font-size: 14px;
  margin-bottom: 12px;
  text-align: center;
}

.signup-btn {
  width: 100%;
  padding: 12px;
  background-color: #35495e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 8px;
}

.signup-btn:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.footer-links {
  margin-top: 20px;
  font-size: 14px;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.footer-links a {
  color: #41b883;
  text-decoration: none;
  font-weight: bold;
}
</style>
