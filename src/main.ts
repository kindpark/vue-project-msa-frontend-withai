import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// 1. Font Awesome 핵심 모듈 및 컴포넌트 불러오기
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// 2. 사용할 특정 아이콘 불러오기 (Regular 패키지의 faHouse)
import { faHouse } from '@fortawesome/free-regular-svg-icons'

// 3. 라이브러리에 아이콘 등록 (이 부분이 빠지면 화면에 안 나옵니다!)
library.add(faHouse)
const app = createApp(App)
// 4. 전역 컴포넌트 등록
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(createPinia())
app.use(router)

app.mount('#app')
