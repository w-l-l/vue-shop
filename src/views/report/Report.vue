<template>
  <div ref="chartBox">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div class="chart" ref="chart"></div>
    </el-card>
  </div>
</template>
<script>
import echarts from 'echarts'
export default {
  data() {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  async mounted() {
    const report = await this.getReportInfo()
    const chartEl = this.$refs.chart
    echarts.init(chartEl).setOption(Object.assign(this.options, report))
    window.onresize = () => {
      clearTimeout(chartEl.time)
      chartEl.time = setTimeout(echarts.init(chartEl).resize, 500)
    }
  },
  methods: {
    async getReportInfo() {
      const { data } = await this.$axios.get('reports/type/1')
      return data.meta.status === 200 ? data.data : this.$message.error('获取折线图数据失败')
    }
  }
}
</script>
<style lang="less" scoped>
.chart {
  width: 100%;
  height: 400px;
}
</style>
