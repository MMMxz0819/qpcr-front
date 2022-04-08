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
            clearable
            placeholder="请输入检测人名"
            v-model="queryInfo.test_name"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getStaticList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-input
            clearable
            placeholder="请输入设备号"
            v-model="queryInfo.static_number"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getStaticList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="queryInfo.static_chip"
            placeholder="请选择检测芯片"
            @change="getStaticList"
          >
            <div style="width:100%">
              <el-option
                style="width:100%"
                v-for="item in chipsList"
                :key="item.chip_id"
                :label="item.chip_name"
                :value="item.chip_id"
              >
              </el-option>
            </div>
          </el-select>
        </el-col>
        <el-col :span="6">
          <div style="width:100%">
            <el-date-picker
              style="width:100%"
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
          </div>
        </el-col>
        <el-col :span="2">
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
        :data="staticList"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="设备号" prop="static_number"></el-table-column>
        <el-table-column label="样本信息" prop="static_price"></el-table-column>
        <el-table-column label="检测人名" prop="test_name"> </el-table-column>
        <el-table-column label="芯片信息" prop="static_chip"
          ><template slot-scope="scope">{{
            chipsList.filter(v => {
              return v.chip_id === scope.row.static_chip;
            })[0].chip_name
          }}</template></el-table-column
        >
        <el-table-column label="检测时间" prop="create_time"
          ><template slot-scope="scope">{{
            scope.row.create_time | dataFormat
          }}</template></el-table-column
        >
        <el-table-column label="结果阴阳性" prop="positive"
          ><template slot-scope="scope">{{
            scope.row.positive
              ? scope.row.positive === "0"
                ? "阴"
                : "阳"
              : "未确认"
          }}</template></el-table-column
        >
        <el-table-column label="操作" width="180px">
          <template slot slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            ></el-button>
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
      width="70%"
      @open="open()"
    >
      <div id="echart1" v-if="progressDialogVisible"></div>
      <el-descriptions class="margin-top" title="预估数据" :column="2" border>
        <el-descriptions-item>
          <template slot="label">
            阈值
          </template>
          {{ this.dty }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label">
            预估阴阳性
          </template>
          {{ this.positive ? "阳" : "阴" }}
        </el-descriptions-item>
        <el-descriptions-item
          :key="index"
          v-for="(item, index) in this.ctValues"
        >
          <template slot="label"> 曲线{{ index + 1 }}-CT值 </template>
          {{ item }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog
      title="确定阴阳性"
      :visible.sync="FormVisible"
      width="50%"
      @close="handleClose"
    >
      <el-form ref="FormRef" label-width="100px">
        <el-form-item label="阴阳性">
          <el-radio v-model="positiveReal" label="0">阴</el-radio>
          <el-radio v-model="positiveReal" label="1">阳</el-radio>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import moment from "moment";

export default {
  data() {
    return {
      positiveReal: null,
      ctValues: [],
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
            return this.chipsList.filter(v => {
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
      multipleSelection: "",

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
      staticList: [],
      // 芯片列表
      chipsList: [],
      // 修改地址对话框
      FormVisible: false,

      // 检测曲线对话框
      progressDialogVisible: false,
      // 检测曲线
      progressInfo: [],
      curChip: {},
      dty: 0,
      positive: false,
      curItem: {}
    };
  },
  created() {
    this.getStaticList();
    this.getChipsList();
  },
  mounted() {
    // this.$nextTick(this.echarts());
  },
  methods: {
    handleClose() {
      this.FormVisible = false;
      this.$refs["FormRef"].resetFields();
    },
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
      let chip = this.curChip;
      let chartDom = document.getElementById("echart1");
      let myChart = this.$echarts.init(chartDom);
      let option;
      option = {
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

      this.modalStatic.y.map((v, index) => {
        option.series.push({
          name: `曲线${index + 1}`,
          data: v,
          type: "line",
          smooth: "false",
          symbol: "none",
          markLine: {
            silent: true,
            lineStyle: {
              color: "#333"
            },
            data: [
              {
                yAxis: this.dty
              }
            ]
          },
          itemStyle: {
            normal: {
              lineStyle: {
                width: 2,
                type: chip.line === "1" ? "dotted" : "solid" // 'dotted'虚线 'solid'实线
                // color: color
              }
            }
          }
        });
      });
      myChart.setOption(option);
    },

    calThreshold(array) {
      let sum = function(x, y) {
        return x + y;
      }; // 求和函数
      let square = function(x) {
        return x * x;
      }; // 数组中每个元素求它的平方
      let data = array; //
      let mean = data.reduce(sum) / data.length;
      let deviations = data.map(function(x) {
        return x - mean;
      });
      let stddev = Math.sqrt(
        deviations.map(square).reduce(sum) / (data.length - 1)
      );

      let CTValue = mean + 10 * stddev;

      this.dty = CTValue;

      return CTValue;
    },

    async getChipsList() {
      const { data: res } = await this.$http.get("chips", {
        params: this.queryInfo2
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取芯片列表失败！");
      }
      this.chipsList = res.data.chips;
      this.show = true;
      console.log(res.data);
    },
    async getStaticList() {
      const { data: res } = await this.$http.get("statics", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取检测数据列表失败！");
      }
      this.total = res.data.total;
      this.staticList = res.data.statics;
    },
    // 分页
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getStaticList();
    },
    handleCurrentChange(newSize) {
      this.queryInfo.pagenum = newSize;
      this.getStaticList();
    },
    showEditDialog(val) {
      this.FormVisible = true;
      this.curItem = val;
      this.positiveReal = this.curItem.positive
    },

    async showProgressDialog(val) {
      const { data: res } = await this.$http.get(`statics/${val.static_id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取检测曲线失败!");
      }

      let data = res.data.ddate;
      this.modalStatic = data;
      this.progressDialogVisible = true;
      this.curChip = res.data.static_chip;

      this.curChip = this.chipsList.find(
        v => v.chip_id === res.data.static_chip
      );

      let ctValue = this.calThreshold(
        // total
        data.y[0].slice(2, 16).map(v => Number(v))
      );

      this.ctValues = data.y.map(v => {
        let bigger = v.filter(k => k > ctValue);
        console.log((v[v.length - 1] - v[0]) / data.x[-1] < 10.0);
        if (!bigger.length) {
          return "无CT值";
        } else {
          if ((v[v.length - 1] - v[0]) / data.x[data.x.length - 1] < 5.0) {
            return "无CT值";
          } else {
            return Math.round(data.x[v.length - bigger.length]);
          }
        }
      });

      this.positive = this.ctValues
        .map(v => {
          if (v === "无CT值") {
            return "阴";
          } else if (v < this.curChip.color_mumber) {
            return "阳";
          }
          return "阴";
        })
        .includes("阳");
    },
    async handlePick(time) {
      this.queryInfo.pagenum = 1;
      this.queryInfo.create_time = [
        moment(time[0]).unix(),
        moment(time[1]).unix()
      ];
      const { data: res } = await this.$http.get("statics", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取检测数据列表失败！");
      }
      this.total = res.data.total;
      this.staticList = res.data.statics;
    },
    // 删除检测数据
    async removeById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该检测数据, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除！");
      }
      console.log(id);
      const { data: res } = await this.$http.delete("statics/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除检测数据失败！");
      }
      this.$message.success("删除检测数据成功！");
      this.getStaticList();
    },
    // 提交form
    async submitForm() {
      console.log(this.curItem);
      const { data: res } = await this.$http.put(
        "statics/" + this.curItem.static_id,
        {
          ...this.curItem,
          positive: this.positiveReal
        }
      );

      if (res.meta.status === 201) {
        this.FormVisible = false;
        this.getStaticList();
        this.$message.success("修改成功");
      } else {
        this.$message.error("修改失败");
      }
      this.$refs["FormRef"].resetFields();
    }
  }
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}

#echart1 {
  height: 400px;
  width: 100%;
  margin: 0 auto;
}
</style>
