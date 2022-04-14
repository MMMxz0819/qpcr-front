<template>
  <div style="height: 100%">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>各疾病统计报表</el-breadcrumb-item>
    </el-breadcrumb>
    <div id="china_map_box">
      <div>
        <el-radio-group
          class="radioButton"
          v-model="radio1"
          @change="getStatic"
        >
          <el-radio-button label="淋病双球菌"></el-radio-button>
          <el-radio-button label="呼吸道疾病"></el-radio-button>
          <el-radio-button label="沙眼衣原体"></el-radio-button>
        </el-radio-group>
      </div>
      <div id="china_map"></div>
    </div>
  </div>
</template>

<script>
import echarts from "echarts";
import "echarts/map/js/china.js";
import { provice } from "./service";

export default {
  name: "Map",
  data() {
    return {
      radio1: "淋病双球菌",
      // echart 配制option
      option: {
        // timeline
        timeline: {
          axisType: "category",
          autoPlay: true,
          playInterval: 1500,

          data: [
            "一月",
            "二月",
            "三月",
            "四月",
            "五月",
            "六月",
            "七月",
            "八月",
            "九月",
            "十月",
            "十一月",
            "十二月",
          ],
        },
        // base
        baseOption: {
          title: {
            text: `   全国各类疾病核酸检测数据统计（截止至${new Date().toLocaleString()}）`,
          },
          tooltip: {
            triggerOn: "mousemove", // mousemove、click
            padding: 8,
            borderWidth: 1,
            borderColor: "#409eff",
            backgroundColor: "rgba(255,255,255,0.7)",
            textStyle: {
              color: "#000000",
              fontSize: 13,
            },
            formatter: function (e, t, n) {
              let data = e.data;

              let context = `
               <div>
                   <p><b style="font-size:15px;">${
  data ? data.name : ""
}</b></p>
                   <p class="tooltip_style"><span class="tooltip_left">检测样本数</span><span class="tooltip_right">${
  data ? data.total : 0
}</span></p>
                    <p class="tooltip_style"><span class="tooltip_left">省内阳性率 </span><span class="tooltip_right">${
  data ? String(data.value * 100).slice(0, 5) : 0
}%</span></p>
                    <p class="tooltip_style"><span class="tooltip_left">病例国内占比</span><span class="tooltip_right">${
  data ? String((data.yang / 4087) * 100).slice(0, 5) : 0
}%</span></p>

               </div>
            `;
              return context;
            },
          },
          visualMap: {
            show: true,
            left: 26,
            bottom: 40,
            showLabel: true,
            pieces: [
              {
                gte: 0.5,
                label: ">= 50%",
                color: "#ff7f7f",
              },
              {
                gte: 0.45,
                lt: 0.5,
                label: "45% - 50%",
                color: "#ffa8a8",
              },
              {
                gte: 0.4,
                lt: 0.45,
                label: "40% - 45%",
                color: "#ffc1c1",
              },
              {
                gte: 0.3,
                lt: 0.4,
                label: "30% - 40%",
                color: "#ffd6d6",
              },
              {
                lt: 0.3,
                label: "<30%",
                color: "#ffe5e5",
              },
            ],
          },
          geo: {
            map: "china",
            scaleLimit: {
              min: 1,
              max: 2,
            },
            zoom: 1,
            top: 120,
            label: {
              normal: {
                show: true,
                fontSize: "14",
                color: "rgba(0,0,0,0.7)",
              },
            },
            itemStyle: {
              normal: {
                // shadowBlur: 50,
                // shadowColor: 'rgba(0, 0, 0, 0.2)',
                borderColor: "rgba(0, 0, 0, 0.2)",
              },
              emphasis: {
                areaColor: "#f2d5ad",
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                borderWidth: 0,
              },
            },
          },
          series: [
            {
              name: "突发事件",
              type: "map",
              geoIndex: 0,
              data: [],
            },
          ],
        },
        options: [

        ],
      },
      // echart data
      dataList: [],
    };
  },
  methods: {
    // 初始化中国地图
    initEchartMap() {
      let mapDiv = document.getElementById("china_map");
      let myChart = echarts.init(mapDiv);
      myChart.setOption(this.option);
    },
    // 修改echart配制
    setEchartOption() {
      this.option.options = []
      for (let index = 1; index < 13; index++) {
        let optionObj = {
          title: {
            text: `${index}月份统计值`,
          },
          series: [
            { seriesLayoutBy: "row", type: "map", data: [] },
          ],
        }

        optionObj.series[0].data = this.dataList.map(v => {
          return {
            name: v.name,
            total: v.total[index - 1],
            type: v.type,
            yang: v.yang[index - 1],
            value: v.yang[index - 1] / v.total[index - 1]
          }
        })

        this.option.options.push(optionObj)
      }

      console.log('dataList', this.option.options);
    },
    async getStatic() {
      await this.$http.get("reports/type/1").then((res) => {
        const result = res.data.data.result;
        this.total = result;
        let diseace = JSON.parse(JSON.stringify(provice));
        if (this.radio1 === "淋病双球菌") {
          result.map((v) => {
            let a = diseace.find((item) => Number(v.id) === Number(item.type));

            a.total = v.rp1_total.trim().split(",");
            a.yang = v.rp1_month.trim().split(",");
          });
          this.dataList = diseace;
        } else if (this.radio1 === "呼吸道疾病") {
          result.map((v) => {
            let a = diseace.find((item) => Number(v.id) === Number(item.type));
            a.total = v.rp2_total.trim().split(",");
            a.yang = v.rp2_month.trim().split(",");
          });
          this.dataList = diseace;
        } else {
          result.map((v) => {
            let a = diseace.find((item) => Number(v.id) === Number(item.type));
            a.total = v.rp3_total.trim().split(",");
            a.yang = v.rp3_month.trim().split(",");
          });
          this.dataList = diseace;
        }
      });
      this.setEchartOption();
      this.initEchartMap();
    },
  },
  created() {
    // this.setEchartOption();
    this.getStatic();
  },
  mounted() {
    this.$nextTick(() => {
      this.initEchartMap();
    });
  },
};
</script>

<style scoped>
.radioButton {
  padding: 20px;
}
#china_map_box {
  background-color: #fff;
  height: 90%;
  position: relative;
}
#china_map_box #china_map {
  height: 100%;
}
#china_map_box .china_map_logo {
  position: absolute;
  top: 0;
  left: 0;
  width: 45px;
}
</style>
<style>
#china_map .tooltip_style {
  line-height: 1.7;
  overflow: hidden;
}
#china_map .tooltip_left {
  float: left;
}
#china_map .tooltip_right {
  float: right;
}
</style>
