<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <div id="app">
    <!-- 상단 공통 네비게이션 바 (필요 시 사용) -->
    <header>
      <nav>
        <RouterLink to="/">홈</RouterLink> |
        <RouterLink to="/login">로그인</RouterLink> |
        <RouterLink to="/mypage">마이페이지</RouterLink> |
        <RouterLink to="/qna">Q&A</RouterLink>
      </nav>
    </header>

    <!-- 라우터에 매핑된 페이지(HomeView, LoginView 등)가 실제로 그려지는 위치 -->
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
header {
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 20px;
}
nav a {
  margin: 0 10px;
  text-decoration: none;
  color: #2c3e50;
  font-weight: bold;
}
nav a.router-link-exact-active {
  color: #42b883; /* 현재 접속 중인 메뉴 색상 */
}
</style>
