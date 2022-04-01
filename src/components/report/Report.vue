<template>
  <div style="height:100%">
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
      options: {
        title: {
          text: `   全国各类疾病核酸检测数据统计（截止至${new Date().toLocaleString()}）`
        },
        tooltip: {
          triggerOn: "mousemove", // mousemove、click
          padding: 8,
          borderWidth: 1,
          borderColor: "#409eff",
          backgroundColor: "rgba(255,255,255,0.7)",
          textStyle: {
            color: "#000000",
            fontSize: 13
          },
          formatter: function(e, t, n) {
            let data = e.data;

            let context = `
               <div>
                   <p><b style="font-size:15px;">${data.name}</b></p>
                   <p class="tooltip_style"><span class="tooltip_left">检测样本数</span><span class="tooltip_right">${
  data.total
}</span></p>
                    <p class="tooltip_style"><span class="tooltip_left">省内阳性率</span><span class="tooltip_right">${(
    data.yang / data.total
  ).toFixed(3) * 100}%</span></p>
                    <p class="tooltip_style"><span class="tooltip_left">病例国内占比</span><span class="tooltip_right">${(
    data.yang / 4087
  ).toFixed(3) * 100}%</span></p>

               </div>
            `;
            return context;
          }
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
              color: "#ff7f7f"
            },
            {
              gte: 0.45,
              lt: 0.5,
              label: "45% - 50%",
              color: "#ffa8a8"
            },
            {
              gte: 0.4,
              lt: 0.45,
              label: "40% - 45%",
              color: "#ffc1c1"
            },
            {
              gte: 0.3,
              lt: 0.4,
              label: "30% - 40%",
              color: "#ffd6d6"
            },
            {
              lt: 0.3,
              label: "<30%",
              color: "#ffe5e5"
            }
          ]
        },
        geo: {
          map: "china",
          scaleLimit: {
            min: 1,
            max: 2
          },
          zoom: 1,
          top: 120,
          label: {
            normal: {
              show: true,
              fontSize: "14",
              color: "rgba(0,0,0,0.7)"
            }
          },
          itemStyle: {
            normal: {
              // shadowBlur: 50,
              // shadowColor: 'rgba(0, 0, 0, 0.2)',
              borderColor: "rgba(0, 0, 0, 0.2)"
            },
            emphasis: {
              areaColor: "#f2d5ad",
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              borderWidth: 0
            }
          }
        },
        series: [
          {
            name: "突发事件",
            type: "map",
            geoIndex: 0,
            data: []
          }
        ]
      },
      // echart data
      dataList: []
    };
  },
  methods: {
    aba() {
      console.log(this.radio1);
    },
    // 初始化中国地图
    initEchartMap() {
      let mapDiv = document.getElementById("china_map");
      let myChart = echarts.init(mapDiv);
      myChart.setOption(this.options);
    },
    // 修改echart配制
    setEchartOption() {
      this.options.series[0]["data"] = this.dataList.map(v => {
        return { ...v, value: v.yang / v.total };
      });
    },
    async getStatic() {
      await this.$http.get("reports/type/3").then(res => {
        const result = res.data.data.result;
        this.total = result;
        let diseace = JSON.parse(JSON.stringify(provice));
        if (this.radio1 === "淋病双球菌") {
          result.map(v => {
            let a = diseace.find(item => v.rp3_1 === item.type);
            if (a.total) {
              a.total++;
            } else {
              a.total = 1;
            }

            if (a.yang && v.rp3_yinyang) {
              a.yang++;
            } else if (v.rp3_yinyang) {
              a.yang = 1;
            }
          });
          this.dataList = diseace;
        } else if (this.radio1 === "呼吸道疾病") {
          result.map(v => {
            let a = diseace.find(item => v.rp3_2 === item.type);
            if (a.total) {
              a.total++;
            } else {
              a.total = 1;
            }

            if (a.yang && v.rp3_yinyang) {
              a.yang++;
            } else if (v.rp3_yinyang) {
              a.yang = 1;
            }
          });
          this.dataList = diseace;
        } else {
          result.map(v => {
            let a = diseace.find(item => v.rp3_3 === item.type);
            if (a.total) {
              a.total++;
            } else {
              a.total = 1;
            }

            if (a.yang && v.rp3_yinyang) {
              a.yang++;
            } else if (v.rp3_yinyang) {
              a.yang = 1;
            }
          });
          this.dataList = diseace;
        }

        console.log(diseace);
      });
      this.setEchartOption();
      this.initEchartMap();
    }
  },
  created() {
    // this.setEchartOption();
    this.getStatic();
  },
  mounted() {
    this.$nextTick(() => {
      this.initEchartMap();
    });
  }
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
