
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
// URL 쿼리 스트링(?productId=1)에서 productId를 추출
const productId = Number(route.query.productId || 1);

// 1. Q&A 객체 타입 정의
interface QnaItem {
  id: number;
  productId: number;
  userId: number;
  title: string;
  content: string;
  answer: string | null;
  isAnswered: boolean;
  createdAt: string;
}

// 2. QnaItem[] 제네릭 명시
const qnaList = ref<QnaItem[]>([]);
const isLoading = ref(true);

// 사용자 문의 작성 폼 상태
const newTitle = ref("");
const newContent = ref("");

// 관리자 작성 폼 상태
const isAdmin = ref(true); // 실무 환경에서는 userStore / JWT Role 기반으로 스위칭
const replyInputs = ref<{ [key: number]: string }>({});

// 특정 상품의 Q&A 목록 조회 (GET /api/v1/qna/list/product/{productId})
const fetchQnaProduct = async () => {
  try {
    isLoading.value = true;
    // 큰따옴표 대신 백틱(`)으로 수정하여 동적 파라미터 전달
    const res = await axios.get(`/api/v1/qna/list/product/${productId}`);
    qnaList.value = res.data;
  } catch (err) {
    console.error("Q&A 목록 로드 실패:", err);
  } finally {
    isLoading.value = false;
  }
};

// 내 Q&A 문의 목록 조회 (GET /api/v1/qna/me)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchQnaOnMe = async () => {
  try {
    isLoading.value = true;
    const res = await axios.get("/api/v1/qna/me");
    qnaList.value = res.data;
  } catch (err) {
    console.error("내 Q&A 목록 로드 실패:", err);
  } finally {
    isLoading.value = false;
  }
};

// Q&A 문의 작성
const submitQuestion = async () => {
  if (!newTitle.value.trim() || !newContent.value.trim()) {
    alert("제목과 내용을 모두 입력해 주세요.");
    return;
  }
  try {
    await axios.post("/api/v1/qna", {
      productId: productId,
      title: newTitle.value,
      content: newContent.value,
    });

    alert("Q&A 문의가 등록되었습니다.");
    newTitle.value = "";
    newContent.value = "";
    fetchQnaProduct(); // 목록 갱신
  } catch (err) {
    console.error("문의 등록 실패:", err);
    alert("문의 등록 중 오류가 발생했습니다.");
  }
};

// 관리자 답변 등록
const submitReply = async (qnaId: number) => {
  const answerText = replyInputs.value[qnaId];
  if (!answerText || !answerText.trim()) {
    alert("답변 내용을 입력해 주세요.");
    return;
  }

  try {
    // QnaReplyRequestDto 구조({ answer: '...' })에 맞춰 전송
    await axios.post(`/api/v1/qna/${qnaId}/reply`, {
      answer: answerText,
    });

    alert("답변이 등록되었습니다.");
    replyInputs.value[qnaId] = "";
    fetchQnaProduct(); // 목록 갱신
  } catch (err) {
    console.error("답변 등록 실패:", err);
    alert("답변 등록 중 오류가 발생했습니다.");
  }
};

// 날짜 포맷팅 함수 (문자열 개행 버그 수정)
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};

onMounted(() => {
  fetchQnaProduct();
});
</script>

<template>
  <div class="qna-container">
    <h2>상품 Q&A</h2>

    <!-- 1. Q&A 문의 작성 섹션 -->
    <section class="qna-form-section">
      <h3>문의하기</h3>
      <div class="form-group">
        <input
          v-model="newTitle"
          type="text"
          placeholder="제목을 입력하세요"
          class="input-title"
        />
        <textarea
          v-model="newContent"
          placeholder="문의할 내용을 상세히 입력하세요"
          rows="4"
          class="input-content"
        ></textarea>
        <button @click="submitQuestion" class="btn-submit">문의 등록</button>
      </div>
    </section>

    <!-- 2. Q&A 목록 및 답변 섹션 -->
    <section class="qna-list-section">
      <h3>문의 목록</h3>

      <div v-if="isLoading" class="state-message">Q&A를 불러오는 중...</div>
      <div v-else-if="qnaList.length === 0" class="state-message">등록된 문의가 없습니다.</div>

      <div v-else class="qna-list">
        <div v-for="qna in qnaList" :key="qna.id" class="qna-card">
          <div class="qna-header">
            <span :class="['badge', qna.isAnswered ? 'done' : 'wait']">
              {{ qna.isAnswered ? '답변완료' : '답변대기' }}
            </span>
            <span class="qna-title">{{ qna.title }}</span>
            <span class="qna-date">{{ formatDate(qna.createdAt) }}</span>
          </div>

          <div class="qna-body">
            <p class="question-text">{{ qna.content }}</p>
          </div>

          <!-- 기존 작성된 답변 출력 -->
          <div v-if="qna.isAnswered" class="answer-box">
            <div class="answer-header">└ 관리자 답변</div>
            <p class="answer-text">{{ qna.answer }}</p>
          </div>

          <!-- 관리자 전용 답변 작성 폼 (답변 미완료 상태일 때만 출력) -->
          <div v-if="isAdmin && !qna.isAnswered" class="admin-reply-form">
            <textarea
              v-model="replyInputs[qna.id]"
              placeholder="관리자 답변을 작성하세요"
              rows="2"
            ></textarea>
            <button @click="submitReply(qna.id)" class="btn-reply">답변 등록</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.qna-container { max-width: 768px; margin: 30px auto; padding: 0 20px; font-family: sans-serif; }
h2 { font-size: 22px; margin-bottom: 24px; color: #191f28; }
h3 { font-size: 16px; margin-bottom: 12px; color: #333d4b; }

.qna-form-section { background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 32px; }
.form-group { display: flex; flex-direction: column; gap: 10px; }
.input-title, .input-content, .admin-reply-form textarea {
  width: 100%; border: 1px solid #e5e8eb; border-radius: 8px; padding: 12px; font-size: 14px; box-sizing: border-box;
}
.input-title:focus, .input-content:focus { outline: none; border-color: #3182f6; }

.btn-submit { align-self: flex-end; background: #3182f6; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-submit:hover { background: #1b64da; }

.state-message { text-align: center; padding: 40px 0; color: #8b95a1; font-size: 14px; }
.qna-list { display: flex; flex-direction: column; gap: 16px; }
.qna-card { border: 1px solid #e5e8eb; border-radius: 12px; padding: 18px; background: #fff; }

.qna-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.badge { font-size: 12px; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
.badge.wait { background: #fff8e1; color: #f57c00; }
.badge.done { background: #e8f3ff; color: #3182f6; }
.qna-title { font-weight: 600; color: #191f28; font-size: 15px; flex: 1; }
.qna-date { font-size: 12px; color: #8b95a1; }

.question-text { color: #4e5968; font-size: 14px; margin: 0 0 12px 0; line-height: 1.5; }

.answer-box { background: #f8f9fa; border-radius: 8px; padding: 12px; margin-top: 12px; }
.answer-header { font-weight: bold; font-size: 13px; color: #3182f6; margin-bottom: 4px; }
.answer-text { font-size: 14px; color: #333d4b; margin: 0; line-height: 1.4; }

.admin-reply-form { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
.btn-reply { background: #333d4b; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; }
</style>

