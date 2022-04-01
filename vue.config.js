module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "https://api.inews.qq.com/newsqa/v1", // 目标地址，一般是指后台服务器地址
        changeOrigin: true, // 是否跨域
        pathRewrite: {
          // pathRewrite 的作用是把实际Request Url中的'/api'用""代替
          "^/api": ""
        }
      }
    }
  },
  chainWebpack: config => {
    // 发布模式
    config.when(process.env.NODE_ENV === "production", config => {
      config
        .entry("app")
        .clear()
        .add("./src/main-prod.js");

      config.set("externals", {
        vue: "Vue",
        "vue-router": "VueRouter",
        axios: "axios",
        lodash: "_",
        echarts: "echarts",
        nprogress: "NProgress",
        "vue-quill-editor": "VueQuillEditor"
      });

      config.plugin("html").tap(args => {
        args[0].isProd = true;
        return args;
      });
    });

    // 开发模式
    config.when(process.env.NODE_ENV === "development", config => {
      config
        .entry("app")
        .clear()
        .add("./src/main-dev.js");

      config.plugin("html").tap(args => {
        args[0].isProd = false;
        return args;
      });
    });
  }
};
