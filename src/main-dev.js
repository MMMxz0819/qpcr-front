import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
// 导入全局样式
import "./assets/css/global.css";
// 导入字体图标
import "./assets/fonts/iconfont.css";
// 导入表格树
import TreeTable from "vue-table-with-tree-grid";
// 导入富文本编辑器
import VueQuillEditor from "vue-quill-editor";
// 导入富文本编辑器样式
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import echarts from "echarts";

import JsonExcel from "vue-json-excel";

import moment from "moment";

import NProgress from "nprogress";
import "nprogress/nprogress.css";

import axios from "axios";
// 配置请求根路径
// 本机地址
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";

axios.interceptors.request.use((config) => {
  NProgress.start();
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});

axios.interceptors.response.use((config) => {
  NProgress.done();
  return config;
});

Vue.prototype.$http = axios;

Vue.prototype.$echarts = echarts;
Vue.prototype.$moment = moment;
Vue.component("downloadExcel", JsonExcel);

Vue.config.productionTip = false;
// 组件全局注册 表格树
Vue.component("tree-table", TreeTable);
// 全局注册富文本编辑器
Vue.use(VueQuillEditor);
Vue.filter("dataFormat", function (originVal) {
  return moment.unix(originVal).format("YYYY-MM-DD HH:MM");
});

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
