<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入商品名称关键字" v-model="queryInfo.query" clearable @clear="getGoodList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoodUrl">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodList" border stripe>
        <el-table-column type="index" label="#">
          <template slot-scope="scope">{{ (queryInfo.pagenum - 1) * queryInfo.pagesize + scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70"></el-table-column>
        <el-table-column label="创建时间" width="140">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editGood(scope.row.goods_id)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="delGood(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      goodList: [],
      total: 0,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      }
    }
  },
  created() {
    this.getGoodList()
  },
  methods: {
    async getGoodList() {
      const { data } = await this.$axios.get('goods', {
        params: this.queryInfo
      })
      if (data.meta.status !== 200) {
        return this.$message.error('商品列表获取失败')
      }
      this.goodList = data.data.goods
      this.total = data.data.total
    },
    handleSizeChange(size) {
      this.queryInfo.pagesize = size
      this.getGoodList()
    },
    handleCurrentChange(page) {
      this.queryInfo.pagenum = page
      this.getGoodList()
    },
    async delGood(id) {
      const confirm = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirm !== 'confirm') return this.$message.info('已取消删除')
      const { data } = await this.$axios.delete(`goods/${id}`)
      if (data.meta.status !== 200) this.$message.error('删除商品失败')
      this.$message.success('删除商品成功')
      this.getGoodList()
    },
    addGoodUrl() {
      this.$router.push('/goods/add')
    },
    editGood(id) {
      this.$router.push(`/goods/edit/${id}`)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
