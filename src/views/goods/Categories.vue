<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      <tree-table :data="categorieList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border>
        <template slot="isOk" slot-scope="scope">
          <i :class="[scope.row.cat_deleted ? 'el-icon-error' : 'el-icon-success']"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" :type="['', 'success', 'warning'][scope.row.cat_level]">{{ ['一', '二', '三'][scope.row.cat_level] }}级</el-tag>
        </template>
        <template slot="editdel" slot-scope="scpoe">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scpoe.row.cat_id)">编辑</el-button
          ><el-button type="danger" icon="el-icon-delete" size="mini" @click="delCate(scpoe.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
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
    <el-dialog title="添加分类" :visible.sync="addCateDialog" width="50%" @close="closeAddCateDialog">
      <el-form :model="addCateFrom" :rules="cateRule" ref="addCateRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateFrom.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader ref="parentCateRef" v-model="parentCate" :options="parentCateList" :props="parentCateProp" clearable @change="handleChange"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="修改分类" :visible.sync="editCateDialog" width="50%" @close="closeEditCateDialog">
      <el-form :model="editCateFrom" :rules="cateRule" ref="editCateRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateFrom.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      categorieList: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'editdel',
          width: 200
        }
      ],
      addCateDialog: false,
      addCateFrom: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      cateRule: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      parentCateList: [],
      parentCate: [],
      parentCateProp: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      editCateDialog: false,
      editCateFrom: {}
    }
  },
  created() {
    this.getCategoriesList()
  },
  methods: {
    async getCategoriesList() {
      const { data } = await this.$axios.get('categories', {
        params: this.queryInfo
      })
      if (data.meta.status !== 200) {
        return this.$message.error('商品分类列表获取失败')
      }
      this.categorieList = data.data.result
      this.total = data.data.total
    },
    handleSizeChange(num) {
      this.queryInfo.pagesize = num
      this.getCategoriesList()
    },
    handleCurrentChange(page) {
      this.queryInfo.pagenum = page
      this.getCategoriesList()
    },
    async showAddCateDialog() {
      const { data } = await this.$axios.get('categories', {
        params: { type: 2 }
      })
      if (data.meta.status !== 200) {
        return this.$message.error('父级分类数据获取失败')
      }
      this.parentCateList = data.data
      this.addCateDialog = true
    },
    handleChange(arr) {
      const len = arr.length
      this.addCateFrom.cat_level = len
      this.addCateFrom.cat_pid = arr[len - 1] || 0
      // 选择分类自动收起下拉框
      this.$refs.parentCateRef.dropDownVisible = false
    },
    closeAddCateDialog() {
      this.$refs.addCateRef.resetFields()
      this.parentCate = []
      this.addCateFrom.cat_level = 0
      this.addCateFrom.cat_pid = 0
    },
    addCate() {
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) return
        const { data } = await this.$axios.post('categories', this.addCateFrom)
        if (data.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.getCategoriesList()
        this.addCateDialog = false
      })
    },
    async showEditCateDialog(id) {
      const { data } = await this.$axios.get(`categories/${id}`)
      if (data.meta.status !== 200) {
        return this.$message.error('分类信息获取失败')
      }
      this.editCateFrom = data.data
      this.editCateDialog = true
    },
    closeEditCateDialog() {
      this.$refs.editCateRef.resetFields()
      this.editCateFrom = {}
    },
    editCate() {
      this.$refs.editCateRef.validate(async valid => {
        if (!valid) return
        const { data } = await this.$axios.put(`categories/${this.editCateFrom.cat_id}`, {
          cat_name: this.editCateFrom.cat_name
        })
        if (data.meta.status !== 200) return this.$message.error('修改分类失败')
        this.$message.success('修改分类成功')
        this.getCategoriesList()
        this.editCateDialog = false
      })
    },
    async delCate(id) {
      const confirm = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirm !== 'confirm') return this.$message.info('已取消删除')
      const { data } = await this.$axios.delete(`categories/${id}`)
      if (data.meta.status !== 200) return this.$message.error('删除分类失败')
      this.$message.success('删除分类成功')
      this.getCategoriesList()
    }
  }
}
</script>

<style lang="less" scoped>
.zk-table {
  margin-top: 15px;
  .el-icon-error {
    color: red;
    font-size: 20px;
  }
  .el-icon-success {
    color: lightgreen;
    font-size: 20px;
  }
}
.el-cascader {
  width: 100%;
}
</style>
