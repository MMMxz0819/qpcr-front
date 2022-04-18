<template>
  <div style="height: 100%">
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>检测数据统计</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card
      body-style="height:100%"
      style="height: 100%"
      v-loading="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
    >
      <el-date-picker
      clearable="false"
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
      <el-select
        clearable
        style="margin-left: 20px"
        v-model="curChip"
        placeholder="请选择检测芯片"
        @change="handlechipPick"
      >
        <div style="width: 100%">
          <el-option
            style="width: 100%"
            v-for="item in chipsList"
            :key="item.chip_id"
            :label="item.chip_name"
            :value="item.chip_id"
          >
          </el-option>
        </div>
      </el-select>
      <div style="height: 50px"></div>
      <!-- 2.为Echarts准备一个Dom -->
      <div id="main" style="width: 100%; height: 400px"></div>
      <div id="equit" style="width: 100%; height: 400px"></div>

      <div class="SIR" v-if="showSIR">
        <img width="50%" src="../../assets/result.png" alt="" />
        <img width="50%" src="../../assets/model.png" alt="" />
      </div>
    </el-card>
  </div>
</template>

<script>
// 1.导入echarts
import echarts from "echarts";
import moment from "moment";

export default {
  data() {
    return {
      showSIR: false,
      loading: false,
      curChip: null,
      chipsList: [],
      chipStatic: [],
      value2: [
        moment().subtract(6, "days").startOf("day"),
        moment().endOf("day"),
      ],
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = moment().endOf("day");
              const start = moment().subtract(6, "days").startOf("day");

              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近30天",
            onClick(picker) {
              const end = moment().endOf("day");
              const start = moment().subtract(29, "days").startOf("day");
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近90天",
            onClick(picker) {
              const end = moment().endOf("day");
              const start = moment().subtract(89, "days").startOf("day");
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10000,
        create_time: [
          moment().subtract(6, "days").startOf("day").unix(),
          moment().endOf("day").unix(),
        ],
        chart: true,
      },
      queryInfo2: {
        query: "",
        pagenum: 1,
        pagesize: 10000,
      },
      // 需要合并的数据
      option: {
        title: {
          left: "center",
          text: "每日检测数据总数",
        },
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ["line", "bar"] },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        tooltip: {
          trigger: "axis",
        },
        dataset: {
          source: [],
        },
        xAxis: {
          type: "category",
          axisPointer: {
            type: "shadow",
          },
        },
        yAxis: [
          {
            type: "value",
            name: "检测总数",
            min: 0,
            axisLabel: {
              formatter: "{value} 次",
            },
          },
          {
            type: "value",
            name: "阴阳性数量",
            min: 0,
            axisLabel: {
              formatter: "{value}次",
            },
          },
        ],

        series: [],
      },
      barOption: {
        title: {
          left: "center",
          text: "每台设备使用情况",
        },
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          type: "category",
          axisLabel: {
            rotate: 45,
          },
        },
        yAxis: { type: "value" },

        series: [],
      },
    };
  },
  created() {},
  async mounted() {
    this.showEchart();
    this.getChipsList();
  },
  methods: {
    async getChipsList() {
      const { data: res } = await this.$http.get("chips", {
        params: this.queryInfo2,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取芯片列表失败！");
      }
      this.chipsList = res.data.chips;
      this.show = true;
    },
    async showEchart(time) {
      this.loading = true;
      var myChart = echarts.init(document.getElementById("main"));
      var myChartEquit = echarts.init(document.getElementById("equit"));
      // if()
      const { data: res } = await this.$http.get("statics", {
        params: time
          ? {
            ...this.queryInfo,
            create_time: [moment(time[0]).unix(), moment(time[1]).unix()],
          }
          : this.queryInfo,
      });

      if (res.meta.status !== 200) return this.$message("获取折线图数据失败!");
      this.handleDay(res.data);
      this.handleStatic(res.data);
      myChart.setOption(this.option);
      myChartEquit.setOption(this.barOption);
      this.loading = false;
    },
    async showEchartChip(chip) {
      this.loading = true;
      var myChart = echarts.init(document.getElementById("main"));
      var myChartEquit = echarts.init(document.getElementById("equit"));
      const { data: res } = await this.$http.get("reports/type", {
        params: {
          typeid: 4,
          chip: chip,
          create_time: [
            moment(this.value2[0]).unix(),
            moment(this.value2[1]).unix(),
          ],
        },
      });

      if (res.meta.status !== 200) return this.$message("获取折线图数据失败!");
      if (res.data.msg === '无法生成趋势图') {
        this.showSIR = false
      } else {
        this.showSIR = true
      }

      this.handleDay(res.data.res);
      this.handleStatic(res.data.res);
      myChart.setOption(this.option);
      myChartEquit.setOption(this.barOption);
      this.loading = false;
    },

    handleStatic(data) {
      let all = data.all;
      let equit = {};
      all.map((v) => {
        if (!equit[v.static_number]) {
          equit[v.static_number] = 1;
          return;
        }

        equit[v.static_number] = equit[v.static_number] + 1;
      });

      const value = Object.values(equit);

      this.barOption.xAxis.data = Object.keys(equit);
      this.barOption.series = [
        {
          name: "使用次数",
          data: value,
          type: "bar",
        },
      ];
    },
    handleDay(data) {
      let all = data.all;
      let start = data.start.sort((a, b) => {
        return a.create_time - b.create_time;
      });
      let source = [];
      let statics = [];
      let xItem = [];
      start.map((v, index) => {
        xItem.push(moment.unix(v.create_time).format("YYYYMMDD"));
        let oneDay = [];
        if (index === start.length - 1) {
          all.map((item) => {
            if (v.create_time <= item.create_time) {
              oneDay.push(item);
            }
          });
        } else {
          all.map((item) => {
            if (
              v.create_time <= item.create_time &&
              item.create_time < start[index + 1].create_time
            ) {
              oneDay.push(item);
            }
          });
        }
        statics.push(oneDay);
      });
      source.push(xItem);

      const positiveSta = statics.map((v) => {
        let unknow = v.filter((item) => !item.positive).length;
        let yang = v.filter((item) => item.positive === "1").length;
        let yin = v.filter((item) => item.positive === "0").length;
        return {
          unknow,
          yang,
          yin,
        };
      });

      this.option.xAxis.data = source[0];

      this.option.series = [];
      this.option.series.push({
        name: "检测次数",
        data: statics.map((v) => v.length),
        type: "line",
        tooltip: {
          valueFormatter: function (value) {
            return value + " 次";
          },
        },
      });

      this.option.series.push({
        name: "未确定阴阳性",
        type: "bar",
        tooltip: {
          valueFormatter: function (value) {
            return value + " 次";
          },
        },
        data: positiveSta.map((v) => v["unknow"]),
      });

      this.option.series.push({
        name: "阳性",
        type: "bar",
        tooltip: {
          valueFormatter: function (value) {
            return value + " 次";
          },
        },
        data: positiveSta.map((v) => v["yang"]),
      });

      this.option.series.push({
        name: "阴性",
        type: "bar",
        tooltip: {
          valueFormatter: function (value) {
            return value + " 次";
          },
        },
        data: positiveSta.map((v) => v["yin"]),
      });

      // this.option.dataset.source = source;
    },
    handlePick(time) {
      if (this.curChip || this.curChip === 0) {
        this.showEchartChip(this.curChip);
      } else {
        this.showEchart(time);
      }
    },
    handlechipPick(chip) {
      if (chip || chip === 0) {
        console.log(chip);
        this.showEchartChip(chip);
      } else {
        this.showSIR = false
        this.showEchart(this.value2);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.SIR {
  display: flex;
}
</style>
