import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VTooltip } from 'floating-vue'
import Toast from 'vue-toastification'
import App from './App.vue'
import router from './router'
import './index.css'
import 'vue-toastification/dist/index.css'
import 'floating-vue/dist/style.css'
import '@fontsource/nunito-sans/300.css'
import '@fontsource/nunito-sans/400.css'
import '@fontsource/nunito-sans/600.css'
import '@fontsource/nunito-sans/700.css'
import '@fontsource/nunito-sans/800.css'

declare global {
  interface Window {
    api: any
  }
}

createApp(App)
  .use(router)
  .use(createPinia())
  .use(Toast, {
    transition: 'Vue-Toastification__fade',
  })
  .directive('tooltip', VTooltip)
  .mount('#app')
