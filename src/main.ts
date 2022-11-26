import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VTooltip } from 'floating-vue'
import Toast from 'vue-toastification'
// @ts-expect-error - No types available
import ResizeTextarea from 'resize-textarea-vue3'
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
postMessage({ payload: 'removeLoading' }, '*')

createApp(App)
  .use(router)
  .use(createPinia())
  .use(Toast, {
    transition: 'Vue-Toastification__fade',
  })
  .use(ResizeTextarea)
  .directive('tooltip', VTooltip)
  .mount('#app')
  .$nextTick(() => {

  })
