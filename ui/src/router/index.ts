import { createRouter, createWebHistory } from 'vue-router'
import HostView from '../views/HostView.vue'
import IndexView from '../views/IndexView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'index',
      component: IndexView,
    },
    {
      path: '/host/:id',
      name: 'host',
      component: HostView,
    },
    //{
    //  path: '/:pathMatch(.*)*',
    //  name: 'NotFound',
    //  component: () => import('@/views/NotFound.vue')
    //}
  ]
})
