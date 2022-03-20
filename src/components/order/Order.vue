<template>
  <div v-if="show">
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>检测信息管理</el-breadcrumb-item>
      <el-breadcrumb-item>检测信息列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <download-excel
            :fields="exportDataStandard"
            :data="multipleSelection"
            type="xls"
            :name="exportName"
            :defaultValue="multipleSelection"
            :fetch="createExportData"
            :before-generate="startDownload"
            :before-finish="finishDownload"
            worksheet="导出信息"
          >
            <el-button icon="el-icon-download">导出</el-button>
          </download-excel>
        </el-col>
      </el-row>

      <!-- 订单列表 -->
      <el-table
        :data="orderList"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="设备号" prop="order_number"></el-table-column>
        <el-table-column label="样本信息" prop="order_price"></el-table-column>
        <el-table-column label="检测人名" prop="order_fapiao_title">
        </el-table-column>
        <el-table-column label="芯片信息" prop="order_pay"
          ><template slot-scope="scope">{{
            goodsList.filter(v => {
              return v.goods_id === scope.row.order_pay;
            })[0].goods_name
          }}</template></el-table-column
        >
        <el-table-column label="检测时间" prop="create_time"
          ><template slot-scope="scope">{{
            scope.row.create_time | dataFormat
          }}</template></el-table-column
        >
        <el-table-column label="操作">
          <template slot slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialog"
            ></el-button>
            <el-button
              type="success"
              size="mini"
              icon="el-icon-location"
              @click="showProgressDialog(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 展示物流进度对话框 -->
    <el-dialog
      title="核酸检测曲线"
      :visible.sync="progressDialogVisible"
      width="50%"
      @open="open()"
    >
      <div id="echart1" v-if="progressDialogVisible"></div>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata.js";

export default {
  data() {
    return {
      exportDataStandard: {
        设备号: "order_number",
        样本信息: "order_price",
        检测人名: "order_fapiao_title",
        芯片信息: "order_pay",
        检测时间: "create_time",
        数据文件路径: "order_fapiao_company"
      },
      exportName: "导出数据",
      multipleSelection: [],

      modalStatic: {
        x: [1, 2],
        y: [5, 5]
      },
      show: false,
      // 订单列表查询参数
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      // 订单列表
      orderList: [],
      // 芯片列表
      goodsList: [],
      // 修改地址对话框
      addressDialogVisible: false,
      addressForm: {
        address1: [],
        address2: ""
      },
      addressFormRules: {
        address1: [
          { required: true, message: "请选择省市区县", trigger: "blur" }
        ],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" }
        ]
      },
      cityData,
      // 物流进度对话框
      progressDialogVisible: false,
      // 物流进度
      progressInfo: []
    };
  },
  created() {
    this.getOrderList();
    this.getGoodsList();
  },
  mounted() {
    // this.$nextTick(this.echarts());
  },
  methods: {
    createExportData() {
      // 点击导出按钮之后,开始导出数据之前的执行函数,返回值为需要下载的数据
      // TODO:构造需要下载的数据返回
      return this.multipleSelection;
    },
    startDownload() {
      console.log("数据开始");
    },
    finishDownload() {
      console.log("数据下载完成");
    },

    // 处理选中
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 图表
    open() {
      // this.modalStatic;
      this.$nextTick(this.echarts);
    },
    echarts() {
      var chartDom = document.getElementById("echart1");
      var myChart = this.$echarts.init(chartDom);
      var option;
      option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985"
            }
          }
        },
        xAxis: {
          type: "category",
          data: this.modalStatic.x
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            data: this.modalStatic.y,
            type: "line",
            smooth: "true"
          }
        ]
      };
      myChart.setOption(option);
    },

    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败！");
      }
      this.goodsList = res.data.goods;
      this.show = true;
      // console.log(this.goodsList);
    },
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败！");
      }
      this.total = res.data.total;
      this.orderList = res.data.goods;
    },
    // 分页
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    handleCurrentChange(newSize) {
      this.queryInfo.pagenum = newSize;
      this.getOrderList();
    },
    showEditDialog() {
      this.addressDialogVisible = true;
    },
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields();
    },
    async showProgressDialog(val) {
      // 供测试的物流单号：1106975712662
      const { data: res } = await this.$http.get(`orders/${val.order_id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取物流进度失败!");
      }
      this.modalStatic = res.data.ddate;
      this.progressDialogVisible = true;
      // console.log(val);
    }
  }
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}

#echart1 {
  height: 350px;
  width: 500px;
  margin: 0 auto;
}
</style>
