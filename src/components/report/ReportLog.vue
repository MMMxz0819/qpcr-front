<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>操作日志</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 表格数据 -->
      <el-table :data="logList" border stripe>
        <el-table-column label="操作时间" prop="time"> </el-table-column>
        <el-table-column label="操作" prop="context"> </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        layout="prev, pager, next"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 曲线颜色选择
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      // 芯片列表
      logList: [],
      totalList: [],
      // 芯片总数
      total: 0,
      curItem: ""
    };
  },
  created() {
    this.getLogsList();
  },
  methods: {
    // 根据分页获取对应的芯片列表
    async getLogsList() {
      this.$http.get("reports/type?typeid=2").then(res => {
        const data = res.data.data;
        if (res.data.meta.status !== 200) {
          return this.$message.error("获取日志列表失败！");
        }

        let logList = data
          .filter(v => v)
          .reverse()
          .map(v => {
            let time = v
              .split("]")[0]
              .slice(1)
              .split("T")
              .join(" ");
            let context = v.split("- ")[1];
            return {
              time,
              context
            };
          });

        this.totalList = logList;
        this.total = logList.length;
        this.logList = logList.slice(0, 10);
      });
    },
    handleCurrentChange(newPage) {
      this.logList = this.totalList.slice(10 * (newPage - 1), 10 * newPage);
    }
  }
};
</script>

<style lang="less" scoped></style>
