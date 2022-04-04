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
          <el-input
          clearable="true"
            placeholder="请输入检测人名"
            v-model="queryInfo.test_name"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrderList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-input clearable="true" placeholder="请输入设备号" v-model="queryInfo.static_number">
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrderList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="value2"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
            @change="handlePick"
          >
          </el-date-picker>
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

      <!-- 检测数据列表 -->
      <el-table
        :data="orderList"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="设备号" prop="static_number"></el-table-column>
        <el-table-column label="样本信息" prop="static_price"></el-table-column>
        <el-table-column label="检测人名" prop="test_name">
        </el-table-column>
        <el-table-column label="芯片信息" prop="static_chip"
          ><template slot-scope="scope">{{
            goodsList.filter(v => {
              return v.chip_id === scope.row.static_chip;
            })[0].chip_name
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
              type="success"
              size="mini"
              icon="el-icon-location"
              @click="showProgressDialog(scope.row)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.static_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <div>
         <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      </div>

    </el-card>

    <!-- 展示检测曲线对话框 -->
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
import moment from "moment";

export default {
  data() {
    return {
      value2: [],
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = moment().endOf("day");
              const start = moment()
                .subtract(6, "days")
                .startOf("day");

              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近30天",
            onClick(picker) {
              const end = moment().endOf("day");
              const start = moment()
                .subtract(29, "days")
                .startOf("day");
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近90天",
            onClick(picker) {
              const end = moment().endOf("day");
              const start = moment()
                .subtract(89, "days")
                .startOf("day");
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      options: {
        1: "#FF0000",
        2: "#008000",
        3: "#FFFF00",
        4: "#F5DEB3",
        5: "#0000FF"
      },
      exportDataStandard: {
        设备号: "static_number",
        样本信息: {
          field: "static_price",
          callback: value => {
            console.log(value);
            if (!value.static_price) return "";
            return value;
          }
        },
        检测人名: "test_name",
        芯片信息: {
          field: "static_chip",
          callback: value => {
            return this.goodsList.filter(v => {
              return v.chip_id === value;
            })[0].chip_name;
          }
        },
        检测时间: {
          field: "create_time",
          callback: value => {
            return this.$moment(value).format("YYYY-MM-DD Hh:Mm:Ss");
          }
        },
        数据文件路径: "static_path"
      },
      exportName: "导出数据",
      multipleSelection: [],

      modalStatic: {
        x: [1, 2],
        y: [5, 5]
      },
      show: false,
      // 检测数据列表查询参数
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      queryInfo2: {
        query: "",
        pagenum: 1,
        pagesize: 10000
      },
      total: 0,
      // 检测数据列表
      orderList: [],
      // 芯片列表
      goodsList: [],
      // 修改地址对话框
      addressDialogVisible: false,
      addressForm: {
        address1: [],
        address2: ""
      },

      // 检测曲线对话框
      progressDialogVisible: false,
      // 检测曲线
      progressInfo: [],
      curChip: 1
    };
  },
  created() {
    this.getOrderList();
    this.getChipsList();
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
      var chip = this.goodsList.find(v => v.chip_id === this.curChip);
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
          boundaryGap: false,
          data: this.modalStatic.x
        },
        yAxis: {
          type: "value"
        },
        series: []
      };

      this.modalStatic.y.map(v => {
        let colorStaff = chip.color_mumber.split(",");
        // eslint-disable-next-line standard/computed-property-even-spacing
        let color = this.options[
          colorStaff[Math.floor(Math.random() * colorStaff.length)]
        ];
        console.log(color);
        option.series.push({
          data: v,
          type: "line",
          smooth: "false",
          symbol: "none",
          itemStyle: {
            normal: {
              lineStyle: {
                width: 2,
                type: chip.line === "1" ? "dotted" : "solid", // 'dotted'虚线 'solid'实线
                color: color
              }
            }
          }
        });
      });
      myChart.setOption(option);
    },

    async getChipsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo2
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取芯片列表失败！");
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
        return this.$message.error("获取检测数据列表失败！");
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
      const { data: res } = await this.$http.get(`orders/${val.static_id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取检测曲线失败!");
      }
      this.modalStatic = res.data.ddate;
      this.progressDialogVisible = true;
      this.curChip = res.data.static_chip;
      // console.log(val);
    },
    async handlePick(time) {
      this.queryInfo.pagenum = 1
      this.queryInfo.create_time = [moment(time[0]).unix(), moment(time[1]).unix()]
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取检测数据列表失败！");
      }
      this.total = res.data.total;
      this.orderList = res.data.goods;
    },
    // 删除检测数据
    async removeById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该检测数据, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除！");
      }
      console.log(id);
      const { data: res } = await this.$http.delete("orders/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除检测数据失败！");
      }
      this.$message.success("删除检测数据成功！");
      this.getOrderList();
    },
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
