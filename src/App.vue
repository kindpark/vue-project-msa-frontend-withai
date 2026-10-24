<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import {useRoute} from 'vue-router';

const route = useRoute();

</script>

<template>
  <div id="app">
    <!-- 상단 공통 네비게이션 바 (필요 시 사용) -->
    <header :class="{'is-sticky': route.path === '/'}">
      <nav class="nav-bar">
        <div class="hamburger">

        </div>
        <div class="logo-zone">
          <RouterLink to="/"><font-awesome-icon icon="fa-regular fa-house" /></RouterLink>
        </div>
        <div class="nav-right">
        <RouterLink to="/mypage">마이페이지</RouterLink>
        <RouterLink to="/qna">Q&A</RouterLink>
        <RouterLink to="/login">로그인</RouterLink>
        </div>
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
.nav-bar{
  display:flex;
  justify-content: space-between;
  align-items: center;
}
.nav-right a {
  margin: 0 7px;
  text-decoration: none;
  color: #2c3e50;
  font-weight: bold;
}
.logo-zone{

}
nav a.router-link-exact-active {
  color: inherit; /* 현재 접속 중인 메뉴 색상 */
}
/* 홈 뷰일 때만 적용될 sticky 스타일 */
header.is-sticky {
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
/* 전역 body 태그의 기본 마진을 0으로 초기화합니다 */
:global(body) {
  margin: 0;
  padding: 0;
}
</style>
