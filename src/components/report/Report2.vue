<template>
  <div style="height:100%">
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>芯片数据统计</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card body-style="height:100%" style="height:100%">
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
      <div style="height:50px"></div>
      <!-- 2.为Echarts准备一个Dom -->
      <div id="main" style="width: 750px;height:100%"></div>
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
      chipStatic: [],
      chipList: [],
      value2: [
        moment()
          .subtract(6, "days")
          .startOf("day"),
        moment().endOf("day")
      ],
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
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 100,
        create_time: [
          moment()
            .subtract(6, "days")
            .startOf("day")
            .unix(),
          moment()
            .endOf("day")
            .unix()
        ]
      },
      // 需要合并的数据
      option: {
        legend: {},
        tooltip: {
          trigger: "axis",
          showContent: false
        },
        dataset: {
          source: []
        },
        xAxis: { type: "category" },
        yAxis: { gridIndex: 0 },
        grid: { top: "55%" },
        series: [
          {
            type: "pie",
            id: "pie",
            radius: "30%",
            center: ["50%", "35%"],
            emphasis: {
              focus: "self"
            },
            label: {
              formatter: "{b}: {@1} ({d}%)"
            },
            encode: {
              itemName: "date",
              value: 1,
              tooltip: 1
            }
          }
        ]
      }
    };
  },
  created() {},
  // 此时,页面上的元素,已经被渲染完毕了
  async mounted() {
    this.getChipList();
    // 3.基于准备好的dom，初始化echarts实例
    this.showEchart();
  },
  methods: {
    async showEchart(time) {
      var myChart = echarts.init(document.getElementById("main"));
      const { data: res } = await this.$http.get("orders", {
        params: time
          ? {
            ...this.queryInfo,
            create_time: [moment(time[0]).unix(), moment(time[1]).unix()]
          }
          : this.queryInfo
      });
      this.handleDay(res);
      if (res.meta.status !== 200) return this.$message("获取折线图数据失败!");
      // {
      //   type: "line",
      //   smooth: true,
      //   seriesLayoutBy: "row",
      //   emphasis: { focus: "series" }
      // },

      myChart.on("updateAxisPointer", function(event) {
        const xAxisInfo = event.axesInfo[0];

        if (xAxisInfo) {
          const dimension = xAxisInfo.value + 1;

          myChart.setOption({
            series: {
              id: "pie",
              label: {
                formatter: "{b}: {@[" + dimension + "]} ({d}%)"
              },
              encode: {
                value: dimension,
                tooltip: dimension
              }
            }
          });
        }
      });

      // 5.展示数据
      myChart.setOption(this.option);
    },
    async getChipList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取芯片列表失败！");
      }
      this.chipList = res.data.goods;
      this.chipList.forEach(v => {
        this.option.series.push(
          {
            type: "line",
            smooth: true,
            seriesLayoutBy: "row",
            emphasis: { focus: "series" }
          },
        )
      })
    },
    handleDay(data) {
      let all = data.data.all;
      let start = data.data.start.sort((a, b) => {
        return a.create_time - b.create_time;
      });
      console.log(all, start);
      let source = []
      let statics = [];
      let xItem = ["date"];
      start.map((v, index) => {
        xItem.push(moment.unix(v.create_time).format("YYYYMMDD"));
        let oneDay = [];
        if (index === start.length - 1) {
          all.map(item => {
            if (v.create_time <= item.create_time) {
              console.log('1');
              oneDay.push(item);
            }
          });
        } else {
          all.map(item => {
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
      console.log(statics);

      source.push(xItem);

      this.chipList.map(j => {
        console.log(j.goods_id);
        let eachChip = [j.goods_name];
        let times = statics.map(v => {
          return v.filter(item => item.order_pay === j.goods_id).length;
        });
        let data = eachChip.concat(times);
        source.push(data);
      });
      console.log(source);
      this.option.dataset.source = source
    },
    async handlePick(time) {
      this.showEchart(time);
    }
  }
};
</script>

<style lang="less" scoped></style>
