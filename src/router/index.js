import { createRouter, createWebHistory } from "vue-router";
import { isAuthenticated } from "@/utils/auth";

// 路由懒加载
const Login = () => import("@/views/Login.vue");
const Register = () => import("@/views/Register.vue");
const Dashboard = () => import("@/views/Dashboard.vue");
const UserProfile = () => import("@/views/UserProfile.vue");
const DeviceList = () => import("@/views/DeviceList.vue");
const DeviceDetail = () => import("@/views/DeviceDetail.vue");
const DeviceLog = () => import("@/views/DeviceLog.vue");

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: "/register",
      name: "Register",
      component: Register,
      meta: { requiresAuth: false },
    },
    {
      path: "/",
      name: "Dashboard",
      component: Dashboard,
      meta: { requiresAuth: true },
      children: [
        {
          path: "/user",
          name: "UserProfile",
          component: UserProfile,
          meta: { requiresAuth: true },
        },
        {
          path: "/devices",
          name: "DeviceList",
          component: DeviceList,
          meta: { requiresAuth: true },
        },
        {
          path: "/devices/:deviceId",
          name: "DeviceDetail",
          component: DeviceDetail,
          meta: { requiresAuth: true },
          props: true,
        },
        {
          path: "/devices/:deviceId/logs",
          name: "DeviceLog",
          component: DeviceLog,
          meta: { requiresAuth: true },
          props: true,
        },
      ],
    },
    // 重定向未匹配路径到Dashboard
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 使用auth.js中的isAuthenticated方法检查用户认证状态
  const isUserAuthenticated = isAuthenticated();

  if (to.meta.requiresAuth && !isUserAuthenticated) {
    // 需要登录但没有有效token，重定向到登录页
    next("/login");
  } else if (
    (to.path === "/login" || to.path === "/register") &&
    isUserAuthenticated
  ) {
    // 已登录用户访问登录或注册页，重定向到首页
    next("/");
  } else {
    next();
  }
});

export default router;
