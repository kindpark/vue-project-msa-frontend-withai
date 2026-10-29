// oxlint-disable-next-line no-unused-vars
import { createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
// 1. 각 페이지 컴포넌트 불러오기 (Lazy Loading 적용으로 성능 최적화)
const HomeView = () => import('@/views/HomeView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const ChangePasswordView = () => import('@/views/ChangePasswordView.vue')
const FindAccountView = () => import('@/views/FindAccountView.vue')
const ProductDetailView = () => import('@/views/ProductDetailView.vue')
const SignupView = () => import('@/views/SignupView.vue')
const CheckoutView = () => import('@/views/CheckoutView.vue')
const MyPageView = () => import('@/views/MyPageView.vue')
const QnaView = () => import('@/views/QnaView.vue')
const PaymentSuccessView = () => import('@/views/PaymentSuccessView.vue')
const PaymentFailView = () => import('@/views/PaymentFailView.vue')

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/signup', name: 'Signup', component: SignupView },
  { path: '/changepw', name: 'ChangePassword', component: ChangePasswordView},
  { path: '/find-account', name: 'FindAccount', component: FindAccountView},
  { path: '/products/:id', name: 'ProductDetail', component: ProductDetailView },
  { path: '/checkout', name: 'Checkout', component: CheckoutView },
  { path: '/mypage', name: 'MyPage', component: MyPageView },
  { path: '/qna', name: 'Qna', component: QnaView },
  { path: '/payments/success', name: 'payments-success', component:PaymentSuccessView },
  { path: '/payments/fail', name: 'payments-fail', component:PaymentFailView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
