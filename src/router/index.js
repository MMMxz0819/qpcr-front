import Vue from "vue";
import VueRouter from "vue-router";

// 路由懒加载
const Login = () =>
  import(
    /* webpackChunkName: "Login_Home_Welcome" */ "../components/Login.vue"
  );
const Home = () =>
  import(/* webpackChunkName: "Login_Home_Welcome" */ "../components/Home.vue");
const Welcome = () =>
  import(/* webpackChunkName: "Welcome" */ "../components/Welcome.vue");

const Users = () =>
  import(
    /* webpackChunkName: "Users_Rights_Roles" */ "../components/user/User.vue"
  );
const Rights = () =>
  import(
    /* webpackChunkName: "Users_Rights_Roles" */ "../components/power/Rights.vue"
  );
const Roles = () =>
  import(
    /* webpackChunkName: "Users_Rights_Roles" */ "../components/power/Roles.vue"
  );

const GoodsList = () =>
  import(/* webpackChunkName: "GoodsList_Add" */ "../components/Chip/List.vue");
const Add = () =>
  import(/* webpackChunkName: "GoodsList_Add" */ "../components/Chip/Add.vue");

const Order = () =>
  import(
    /* webpackChunkName: "Order_Report" */ "../components/Static/Static.vue"
  );
const Report = () =>
  import(
    /* webpackChunkName: "Order_Report" */ "../components/report/Report.vue"
  );
const StaticReport = () =>
  import(
    /* webpackChunkName: "ChipReport" */ "../components/report/Report2.vue"
  );
const ChipReport = () =>
  import(
    /* webpackChunkName: "ChipReport" */ "../components/report/Report3.vue"
  );
const LogReport = () =>
  import(
    /* webpackChunkName: "LogReport" */ "../components/report/ReportLog.vue"
  );

Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  {
    path: "/home",
    component: Home,
    redirect: "/Welcome",
    children: [
      { path: "/home", component: Welcome },
      { path: "/users", component: Users },
      { path: "/rights", component: Rights },
      { path: "/roles", component: Roles },
      { path: "/statics", component: Order },
      { path: "/statics/add", component: Add },
      { path: "/chip", component: GoodsList },
      { path: "/reports", component: Report },
      { path: "/reports-chip", component: ChipReport },
      { path: "/reports-log", component: LogReport },
      { path: "/reports-static", component: StaticReport }
    ]
  }
];

const router = new VueRouter({
  routes
});

router.beforeEach((to, from, next) => {
  // 访问登录页，放行
  if (to.path === "/login") return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem("token");
  // 没有token, 强制跳转到登录页
  if (!tokenStr) return next("/login");
  next();
});

export default router;
