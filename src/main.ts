import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VTooltip } from 'floating-vue'
import App from './App.vue'
import router from './router'
import './index.css'
import 'vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css'
import 'floating-vue/dist/style.css'

// import './samples/node-api'

const pinia = createPinia()

createApp(App)
  .use(router)
  .use(pinia)
  .directive('tooltip', VTooltip)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
