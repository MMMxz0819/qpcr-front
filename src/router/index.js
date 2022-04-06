import Vue from "vue";
import VueRouter from "vue-router";

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'

// import Users from '../components/user/User.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'

// import Cate from '../components/Chip/Cate.vue'
// import Params from '../components/Chip/Params.vue'

// import GoodsList from '../components/Chip/List.vue'
// import Add from '../components/Chip/Add.vue'

// import Order from '../components/order/Static.vue'
// import Report from '../components/report/Report.vue'

// 路由懒加载
const Login = () =>
  import(
    /* webpackChunkName: "Login_Home_Welcome" */ "../components/Login.vue"
  );
const Home = () =>
  import(/* webpackChunkName: "Login_Home_Welcome" */ "../components/Home.vue");
const Welcome = () =>
  import(
    /* webpackChunkName: "Login_Home_Welcome" */ "../components/Welcome.vue"
  );

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

const Cate = () =>
  import(/* webpackChunkName: "Cate_Params" */ "../components/Chip/Cate.vue");
const Params = () =>
  import(/* webpackChunkName: "Cate_Params" */ "../components/Chip/Params.vue");

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
const ChipReport = () =>
  import(
    /* webpackChunkName: "ChipReport" */ "../components/report/Report2.vue"
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
      { path: "/categories", component: Cate },
      { path: "/params", component: Params },
      { path: "/statics", component: Order },
      { path: "/statics/add", component: Add },
      { path: "/chip", component: GoodsList },
      { path: "/reports", component: Report },
      { path: "/reports-chip", component: ChipReport },
      { path: "/reports-log", component: LogReport }
    ]
  }
];

const router = new VueRouter({
  routes
});

// 挂载路由导航守卫,to表示将要访问的路径，from表示从哪里来，next是下一个要做的操作 next('/login')强制跳转login
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
