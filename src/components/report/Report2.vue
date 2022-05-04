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
        :clearable="false"
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

      <div
        class="SIR"
        :style="{ opacity: showSIR ? 1 : 0 }"
        style="margintop: 60px; padding: 0 20px"
      >
        <div id="model" style="width: 50%; height: 400px"></div>
        <div id="compare" style="width: 50%; height: 400px"></div>
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
      modeloption: {
        title: {
          text: "SIR Model",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["Infectious", "Susceptibles", "Recovereds", "Death"],
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: Array.from({ length: 50 }, (_, i) => 1 + i),
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "Infectious",
            type: "line",
            data: [],
          },
          {
            name: "Susceptibles",
            type: "line",
            data: [],
          },
          {
            name: "Recovereds",
            type: "line",
            data: [],
          },
          {
            name: "Death",
            type: "line",
            data: [],
          },
        ],
      },
      compareOption: {
        title: {
          text: "Real and Trend",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["Real", "forecast"],
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "Real",
            type: "scatter",
            symbolSize: 10,
            data: [],
          },
          {
            name: "forecast",
            type: "line",
            data: [],
          },
        ],
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
      // if (document.getElementById("model")) {
      //   var myChartModel = echarts.init(document.getElementById("model"));
      // }
      var myChartModel = echarts.init(document.getElementById("model"));
      var myChartCompare = echarts.init(document.getElementById("compare"));

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
      this.handleModel(res.data.chart);
      myChart.setOption(this.option);
      myChartEquit.setOption(this.barOption);
      myChartModel.setOption(this.modeloption);
      myChartCompare.setOption(this.compareOption);

      this.loading = false;
    },
    async showEchartChip(chip) {
      this.loading = true;
      var myChart = echarts.init(document.getElementById("main"));
      var myChartEquit = echarts.init(document.getElementById("equit"));
      var myChartModel = echarts.init(document.getElementById("model"));
      var myChartCompare = echarts.init(document.getElementById("compare"));

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
      if (res.data.msg === "无法生成趋势图") {
        this.showSIR = false;
      } else {
        this.showSIR = true;
      }

      if (!res.data.res.all.length) {
        this.showSIR = false;
      }

      this.handleDay(res.data.res);
      this.handleStatic(res.data.res);
      this.handleModel(res.data.chart);
      myChart.setOption(this.option);
      myChartEquit.setOption(this.barOption);
      myChartModel.setOption(this.modeloption);
      myChartCompare.setOption(this.compareOption);
      // if (myChartModel) {
      //   this.$nextTick(() => myChartModel.setOption(this.modeloption));
      // }
      this.loading = false;
    },
    handleModel(data) {
      if (data) {
        this.modeloption.series.find((v) => v["name"] === "Infectious").data =
          data["Infectious"];
        this.modeloption.series.find((v) => v["name"] === "Susceptibles").data =
          data["Susceptibles"];
        this.modeloption.series.filter(
          (v) => v["name"] === "Recovereds"
        )[0].data = data["Recovereds"];
        this.modeloption.series.find((v) => v["name"] === "Death").data =
          data["Death"];

        this.compareOption.series.find((v) => v["name"] === "forecast").data =
          data["Infectious"];
      }
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
      this.compareOption.xAxis.data = [
        ...source[0],
        ...Array(50 - source[0].length).fill(""),
      ];
      this.compareOption.series.find((v) => v["name"] === "Real").data =
        positiveSta.map((v) => v["yang"]);

      if (positiveSta[0] && positiveSta[0]["yang"] < 50) {
        this.compareOption.yAxis.max = 1000;
      }

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
        this.$nextTick(() => {
          this.showEchartChip(this.curChip);
        });
        // this.showEchartChip(this.curChip);
      } else {
        this.$nextTick(() => {
          this.showEchart(time);
        });
        // this.showEchart(time);
      }
    },
    handlechipPick(chip) {
      if (chip || chip === 0) {
        console.log(chip);
        this.$nextTick(() => {
          this.showEchartChip(chip);
        });
        // this.showEchartChip(chip);
      } else {
        this.showSIR = false;
        // this.showEchart(this.value2);
        this.$nextTick(() => {
          this.showEchart(this.value2);
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.SIR {
  display: flex;
  // width: 100%;
}
</style>
