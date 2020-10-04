<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <el-row class="cate_row">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectCate"
            :options="cateList"
            :props="cateProp"
            @change="cateSelectChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="tabsClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="small"
            :disabled="!cateId"
            @click="showAddDialog"
            >添加参数</el-button
          >
          <el-table :data="manyList" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="delParamsValue(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else size="small" @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="delParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="small"
            :disabled="!cateId"
            @click="showAddDialog"
            >添加属性</el-button
          >
          <el-table :data="onlyList" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="delParamsValue(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else size="small" @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="属性名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="delParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog
      :title="`${isAdd ? '添加' : '修改'}${paramsAttrTitle}`"
      :visible.sync="paramsAttrVisible"
      width="50%"
      @close="closeParamsAttrDialog"
    >
      <el-form
        :model="paramsAttrFrom"
        :rules="paramsAttrFromRule"
        ref="paramsAttrRef"
        label-width="80px"
      >
        <el-form-item :label="paramsAttrTitle" prop="attr_name">
          <el-input v-model="paramsAttrFrom.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="paramsAttrVisible = false">取 消</el-button>
        <el-button type="primary" @click="addEditParamsAttr">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      selectCate: [],
      cateProp: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      activeName: 'many',
      manyList: [],
      onlyList: [],
      paramsAttrVisible: false,
      paramsAttrFrom: { attr_name: '' },
      paramsAttrFromRule: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur',
          },
        ],
      },
      isAdd: true,
    }
  },
  computed: {
    cateId() {
      return this.selectCate.length === 3 ? this.selectCate[2] : null
    },
    paramsAttrTitle() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    },
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data } = await this.$axios.get('categories')
      if (data.meta.status !== 200) {
        return this.$message.error('商品分类数据获取失败')
      }
      this.cateList = data.data
    },
    cateSelectChange() {
      this.getParamsList()
    },
    tabsClick() {
      this.getParamsList()
    },
    async getParamsList() {
      if (this.selectCate.length !== 3) {
        this.selectCate = this.manyList = this.onlyList = []
        return
      }
      const { data } = await this.$axios.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      )
      if (data.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      data.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      this.activeName === 'many'
        ? (this.manyList = data.data)
        : (this.onlyList = data.data)
    },
    closeParamsAttrDialog() {
      this.$refs.paramsAttrRef.resetFields()
    },
    showAddDialog() {
      this.isAdd = this.paramsAttrVisible = true
    },
    async showEditDialog(attrId) {
      const { data } = await this.$axios.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: { attr_sel: this.activeName },
        }
      )
      if (data.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }
      this.paramsAttrFrom = data.data
      this.isAdd = false
      this.paramsAttrVisible = true
    },
    addEditParamsAttr() {
      this.$refs.paramsAttrRef.validate(async (valid) => {
        if (!valid) return
        const n = this.isAdd >> 0
        const request = ['put', 'post'][n]
        const url = [`/${this.paramsAttrFrom.attr_id}`, ''][n]
        const state = [200, 201][n]
        const { data } = await this.$axios[request](
          `categories/${this.cateId}/attributes${url}`,
          {
            attr_name: this.paramsAttrFrom.attr_name,
            attr_sel: this.activeName,
          }
        )
        const msg = ['修改', '添加'][n] + this.paramsAttrTitle
        if (data.meta.status !== state) return this.$message.error(`${msg}失败`)
        this.$message.success(`${msg}成功`)
        this.getParamsList()
        this.paramsAttrVisible = false
      })
    },
    async delParams(attrId) {
      const confirm = await this.$confirm(
        `此操作将永久删除该${this.paramsAttrTitle}, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirm !== 'confirm') return this.$message.info('已取消删除')
      const { data } = await this.$axios.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )
      const msg = `删除${this.paramsAttrTitle}`
      if (data.meta.status !== 200) return this.$message.error(`${msg}失败`)
      this.$message.success(`${msg}成功`)
      this.getParamsList()
    },
    handleInputConfirm(attrInfo) {
      attrInfo.inputVisible = false
      const value = attrInfo.inputValue.trim()
      if (value) {
        attrInfo.attr_vals.push(value)
        this.saveParamsValue(attrInfo, '添加', () => attrInfo.attr_vals.pop())
      }
      attrInfo.inputValue = ''
    },
    showInput(attrInfo) {
      attrInfo.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async saveParamsValue(attrInfo, msg, callback) {
      const { data } = await this.$axios.put(
        `categories/${this.cateId}/attributes/${attrInfo.attr_id}`,
        {
          attr_name: attrInfo.attr_name,
          attr_sel: attrInfo.attr_sel,
          attr_vals: attrInfo.attr_vals.join(','),
        }
      )
      msg = `${msg}参数项`
      if (data.meta.status !== 200) {
        callback()
        return this.$message.error(`${msg}失败`)
      }
      this.$message.success(`${msg}成功`)
    },
    delParamsValue(i, attrInfo) {
      const value = attrInfo.attr_vals.splice(i, 1)
      this.saveParamsValue(attrInfo, '删除', () =>
        attrInfo.attr_vals.splice(i, 0, value.join())
      )
    },
  },
}
</script>

<style lang="less" scoped>
.cate_row {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
