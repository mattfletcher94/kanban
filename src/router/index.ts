import { createRouter, createWebHashHistory } from 'vue-router'
import PageBoard from '../pages/PageBoard.vue'

export default createRouter({
  history: createWebHashHistory('/'),
  routes: [
    {
      path: '/',
      component: PageBoard,
    },
    {
      path: '/boards/:boardId',
      component: PageBoard,
    },
  ],
})
