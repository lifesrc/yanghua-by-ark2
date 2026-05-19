import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('@/views/Calendar.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('@/views/Stats.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/square',
    name: 'Square',
    component: () => import('@/views/Square.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/plant/:id',
    name: 'PlantDetail',
    component: () => import('@/views/PlantDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/plant/add',
    name: 'PlantAdd',
    component: () => import('@/views/PlantForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/plant/edit/:id',
    name: 'PlantEdit',
    component: () => import('@/views/PlantForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:id/plants',
    name: 'UserPlants',
    component: () => import('@/views/UserPlants.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:id/records',
    name: 'UserRecords',
    component: () => import('@/views/UserRecords.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:id/stats',
    name: 'UserStats',
    component: () => import('@/views/Stats.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !authStore.token) {
    next('/login')
  } else if (to.path === '/login' && authStore.token) {
    next('/home')
  } else {
    next()
  }
})

export default router
