import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getToken } from '@/utils/auth';

const routes = [
  // 欢迎页，作为入口页面，不需要认证
    {
      path: '/',
    name: 'Welcome',
    component: () => import('@/views/WelcomeView.vue'),
    meta: { requiresAuth: false, title: '西电 CTF 终端' }
    },
    {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresAuth: false, title: '注册' }
  },
  {
    path: '/home',
    component: () => import('@/components/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'questions',
        name: 'Questions',
        component: () => import('@/views/question/QuestionsView.vue'),
        meta: { title: '题目列表' }
      },
      {
        path: 'questions/:id',
        name: 'QuestionDetail',
        component: () => import('@/views/question/QuestionDetailView.vue'),
        meta: { title: '题目详情' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/user/ProfileView.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { requiresAdmin: true, title: '管理面板' }
      },
      {
        path: 'test/detail',
        name: 'TestDetail',
        component: () => import('@/views/test/TestDetailView.vue'),
        meta: { title: '题目详情测试' }
      },
      {
        path: 'deploy',
        name: 'Deploy',
        component: () => import('../views/DeployView.vue'),
        meta: { title: 'AI 部署助手' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面未找到' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 动态设置页面标题
router.afterEach((to) => {
  const title = to.meta.title ? `${to.meta.title} - TJB-CTF` : 'TJB-CTF';
  document.title = title;
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  console.log(`路由导航: ${from.path} -> ${to.path}`);
  
  const userStore = useUserStore();
  const token = getToken();
  
  // 不需要认证的页面，直接放行
  if (!to.meta.requiresAuth) {
    next();
    return;
  }

  // 没有token，直接跳转到登录页
  if (!token) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }

  // 已有token但没有用户信息，尝试获取用户信息
  if (token && !userStore.userInfo.user_id) {
    try {
      await userStore.getUserInfoAction();
    } catch (error) {
      console.error('路由守卫中获取用户信息失败:', error);
      userStore.logout();
      next({ name: 'Login', query: { redirect: to.fullPath } });
      return;
    }
  }

  // 验证路由访问权限
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (to.meta.requiresAdmin && !userStore.userInfo.is_admin) {
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router;
