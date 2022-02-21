import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        name: 'Welcome',
        component: () => import('../views/Welcome/index.vue'),
      },
      {
        path: '/everyone-against',
        name: 'EveryoneAgainst',
        component: () => import('../views/EveryoneAgainst/index.vue'),
      },
      {
        path: '/human-computer-fighting',
        name: 'HumanComputerFighting',
        component: () => import('../views/HumanComputerFighting/index.vue'),
      },
      {
        path: '/ai-study',
        name: 'AiStudy',
        component: () => import('../views/AiStudy/index.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
