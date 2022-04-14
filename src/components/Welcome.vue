<template>
  <div id="china_map_box">
    <div id="china_map"></div>
    <div id="china_static">
      <el-card class="box-card" shadow="always">
        <div class="item">
          本土现有确诊：
          <div style="color:#e61c1d;font-weight:800">
            {{ this.total.localConfirm }}
          </div>
          <div
            class="tip"
            :style="{ color: this.add.localConfirm > 0 ? '#be2121' : '#67C23A' }"
          >
            <i
              :class="[
                this.add.localConfirm > 0
                  ? 'el-icon-caret-top'
                  : 'el-icon-caret-bottom'
              ]"
              style="marginLeft: 10px;"
            ></i
            >{{ this.add.localConfirm }}
          </div>
        </div>
        <div class="item">
          无症状感染者：
          <div style="color:#ae3ac6;font-weight:800">
            {{ this.total.noInfect }}
          </div>
          <div
            class="tip"
            :style="{ color: this.add.noInfect > 0 ? '#be2121' : '#67C23A' }"
          >
            <i
              :class="[
                this.add.noInfect > 0
                  ? 'el-icon-caret-top'
                  : 'el-icon-caret-bottom'
              ]"
              style="marginLeft: 10px;"
            ></i
            >{{ this.add.noInfect }}
          </div>
        </div>
        <div class="item">
          累计确诊：
          <div style="color:#4e8be6;font-weight:800">
            {{ this.total.confirm }}
          </div>
          <div
            class="tip"
            :style="{ color: this.add.confirm > 0 ? '#be2121' : '#67C23A' }"
          >
            <i
              :class="[
                this.add.confirm > 0
                  ? 'el-icon-caret-top'
                  : 'el-icon-caret-bottom'
              ]"
              style="marginLeft:10px"
            ></i>
            {{ this.add.confirm }}
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import echarts from "echarts";
import 'echarts/map/js/china.js';

import axios from "axios";
export default {
  name: "Map",
  data() {
    return {
      total: [],
      add: [],
      // echart 配制option
      options: {
        title: {
          text: `新型冠状病毒肺炎疫情实时追踪（截止至${new Date().toLocaleString()}）`,
          subtext:
            "数据来源于国家卫健委、各省市区卫健委、各省市区政府以及港澳台官方渠道。"
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
                   <p class="tooltip_style"><span class="tooltip_left">现有确诊</span><span class="tooltip_right">${data.total.nowConfirm}</span></p>
                    <p class="tooltip_style"><span class="tooltip_left">本土无症状</span><span class="tooltip_right">${data.total.wzz}</span></p>
                    <p class="tooltip_style"><span class="tooltip_left">累计确诊</span><span class="tooltip_right">${data.total.confirm}</span></p>
                    <p class="tooltip_style"><span class="tooltip_left">累计死亡</span><span class="tooltip_right">${data.total.dead}</span></p>
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
              gte: 1000,
              label: ">= 1000",
              color: "#A0522D"
            },
            {
              gte: 500,
              lt: 999,
              label: "500 - 999",
              color: "#D2691E"
            },
            {
              gte: 100,
              lt: 499,
              label: "100 - 499",
              color: "#FF8C00"
            },
            {
              gte: 10,
              lt: 99,
              label: "10 - 99",
              color: "#FFA500"
            },
            {
              lt: 10,
              label: "<10",
              color: "#FFDEAD"
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
    // 初始化中国地图
    initEchartMap() {
      let mapDiv = document.getElementById("china_map");
      let myChart = echarts.init(mapDiv);
      myChart.setOption(this.options);
    },
    // 修改echart配制
    setEchartOption() {
      this.options.series[0]["data"] = this.dataList.map(v => {
        return { ...v, value: v.total.nowConfirm };
      });
    },
    async getStatic() {
      await axios
        .get(
          "http://localhost:8081/api/query/inner/publish/modules/list?modules=statisGradeCityDetail,diseaseh5Shelf"
        )
        .then(res => {
          this.total = res.data.data.diseaseh5Shelf.chinaTotal;
          this.add = res.data.data.diseaseh5Shelf.chinaAdd;
          this.dataList = res.data.data.diseaseh5Shelf.areaTree[0].children;
        });
      this.setEchartOption();
      this.initEchartMap();
    }
  },
  created() {
    // this.setEchartOption();
    this.getStatic();
  }
  // mounted() {
  //   this.$nextTick(() => {
  //     this.initEchartMap();
  //   });
  // }
};
</script>

<style scoped lang="less">
#china_map_box {
  background-color: #fff;
  height: 100%;
  position: relative;
  display: flex;
}
#china_map_box #china_map {
  height: 100%;
  flex: 4;
}
#china_map_box #china_static {
  flex: 2;
  position: relative;
  right: 50px;
  margin-top: 20px;

  .item {
    display: flex;
    justify-content: space-around;
    align-items: center;
    font-size: 20px;
    padding-bottom: 10px;

    .tip {
      font-size: 14px;
    }
  }
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
