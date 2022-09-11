import { createRouter, createWebHistory } from 'vue-router'
import PageBoard from '../pages/PageBoard.vue'

export default createRouter({
  history: createWebHistory(),
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
