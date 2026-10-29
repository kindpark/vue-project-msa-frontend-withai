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

// 2. never[] 대신 QnaItem[] 제네릭 명시
const qnaList = ref<QnaItem[]>([]);
const isLoading = ref(true);
//사용자 문의 작성 폼 상태
const newContent = ref("");
const newTitle = ref("");

// 관리자 작성 폼 상태
const isAdmin = ref(true); // 실무 환경에서는 userStore / JWT Role 기반으로 스위칭
const replyInputs = ref<{ [key: number]: string }>({});

// 특정 상품의 Q&A 목록 조회 (GET /api/v1/qna/list/product/{productId})
const fetchQnaProduct = async () => {
  try {
    isLoading.value = true;
    const res = await axios.get("/api/v1/qna/list/product/${productId}");
    qnaList.value = res.data;
  } catch (err) {
    console.error("Q&A 목록 로드 실패:", err);
  } finally {
    isLoading.value = false;
  }
};

// 내 qna 문의 목록 조회
const fetchQnaOnMe = async () => {
  try {
    isLoading.value = true;
    const res = await axios.get("/api/v1/qna/list/user/${userId}");
    qnaList.value = res.data;
  } catch (err) {
    console.error("Q&A 목록 로드 실패:", err);
  } finally {
    isLoading.value = false;
  }
};

// qna 문의 작성
const submitQuestion = async () => {
  if (!newTitle.value.trim() || !newContent.value.trim()) {
    alert("제목과 내용을 모두 입력해주세요.");
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
  } catch (err: any) {
    console.error("답변 등록 실패:", err);
    alert("답변 등록 중 오류가 발생했습니다.");
  }
};

const submitQna = async () => {
  if (!newContent.value.trim()) return;

  try {
    const token = localStorage.getItem("accessToken");
    await axios.post(
      "/api/v1/qna",
      {
        content: newContent.value,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    newContent.value = "";
    alert("문의가 등록되었습니다.");
    fetchQna();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    alert("문의 등록 실패: 로그인 상태를 확인해 주세요.");
  }
};

onMounted(fetchQna);
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
.container {
  max-width: 700px;
  margin: 40px auto;
  padding: 20px;
  text-align: left;
}
.write-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
}
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
button {
  align-self: flex-end;
  padding: 10px 20px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.qna-card {
  border-bottom: 1px solid #eee;
  padding: 15px 0;
}
.question {
  font-size: 16px;
  margin: 0 0 8px 0;
}
.answer {
  font-size: 15px;
  color: #555;
  margin: 0;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
}
.pending {
  color: #999;
}
</style>
