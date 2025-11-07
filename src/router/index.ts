import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import TasksView from '@/views/TasksView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true },
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: TasksView,
      meta: { auth: true },
    },
    { path: '/', redirect: '/tasks' },
    { path: '/:pathMatch(.*)*', redirect: '/tasks' },
  ],
});

router.beforeEach((to, _from, next) => {
  const authed = !!localStorage.getItem('access_token');
  if (!authed && to.path !== '/login') return next('/login');
  if (authed && to.path === '/login') return next('/tasks');
  next();
});

export default router;
