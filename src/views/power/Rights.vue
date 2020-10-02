<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-table :data="rightList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column label="权限等级">
          <template slot-scope="scope">
            <el-tag :type="['', 'success', 'warning'][scope.row.level]"
              >{{ ['一', '二', '三'][scope.row.level] }}级</el-tag
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rightList: [],
    }
  },
  created() {
    this.getRightList()
  },
  methods: {
    async getRightList() {
      const { data } = await this.$axios.get('rights/list')
      if (data.meta.status !== 200) {
        return this.$message.error('权限列表获取失败')
      }
      this.rightList = data.data
    },
  },
}
</script>
