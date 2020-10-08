<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入订单编号关键字"
            v-model="queryInfo.query"
            clearable
            @clear="getOrderList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrderList"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#">
          <template slot-scope="scope">{{
            (queryInfo.pagenum - 1) * queryInfo.pagesize + scope.$index + 1
          }}</template>
        </el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column
          prop="order_price"
          label="订单价格"
          width="100"
        ></el-table-column>
        <el-table-column label="是否付款" width="100">
          <template slot-scope="scope">
            <el-tag :type="['danger', 'success'][scope.row.pay_status]"
              >{{ ['未', '已'][scope.row.pay_status] }}付款</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="is_send"
          label="是否发货"
          width="100"
        ></el-table-column>
        <el-table-column label="下架时间" width="200">
          <template slot-scope="scope">{{
            scope.row.create_time | dateFormat
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditSiteDialog(scope.row.order_id)"
            ></el-button>
            <el-button
              type="success"
              size="mini"
              icon="el-icon-location"
              @click="showProgressDialog"
            ></el-button>
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
    <el-dialog
      title="修改订单"
      :visible.sync="editSiteDialog"
      width="50%"
      @close="closeEditSiteDialog"
    >
      <el-form
        :model="editSiteForm"
        :rules="editSiteRule"
        ref="editSiteRef"
        label-width="90px"
      >
        <el-form-item label="订单编号">
          <el-input v-model="editSiteForm.order_number" disabled></el-input>
        </el-form-item>
        <el-form-item label="订单价格" prop="order_price">
          <el-input-number
            v-model="editSiteForm.order_price"
            :min="1"
            :precision="2"
            @change="numberChange('order_price')"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="支付方式" prop="order_pay">
          <el-radio-group v-model="editSiteForm.order_pay">
            <el-radio label="0">未支付</el-radio>
            <el-radio label="1">支付宝</el-radio>
            <el-radio label="2">微信</el-radio>
            <el-radio label="3">银行卡</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否发货">
          <el-switch
            v-model="editSiteForm.is_send"
            active-value="是"
            active-text="是"
            inactive-value="否"
            inactive-text="否"
          >
          </el-switch>
        </el-form-item>
        <el-form-item label="省市区/县" prop="site1">
          <el-cascader
            v-model="editSiteForm.site1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
            @change="site1Change"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="site2">
          <el-input v-model="editSiteForm.site2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editSiteDialog = false">取 消</el-button>
        <el-button type="primary" @click="editSite">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="物流进度" :visible.sync="progressDialog" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in progressList"
          :key="index"
          :timestamp="item.time"
        >
          {{ item.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityData from './citydata'
import _ from 'lodash'
export default {
  data() {
    return {
      orderList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },
      total: 0,
      editSiteDialog: false,
      editSiteForm: {},
      editSiteRule: {
        site1: [{ required: true, message: '请选择省市区县', trigger: 'blur' }],
        site2: [{ required: true, message: '请填写详细地址', trigger: 'blur' }],
        order_price: [
          { required: true, message: '订单价格不能为空', trigger: 'blur' },
        ],
        order_pay: [
          { required: true, message: '请选择支付方式', trigger: 'blur' },
        ],
      },
      cityData,
      progressDialog: false,
      progressList: [],
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data } = await this.$axios.get('orders', {
        params: this.queryInfo,
      })
      if (data.meta.status !== 200) {
        return this.$message.error('订单列表获取失败')
      }
      this.orderList = data.data.goods
      this.total = data.data.total
    },
    handleSizeChange(size) {
      this.queryInfo.pagesize = size
      this.getOrderList()
    },
    handleCurrentChange(page) {
      this.queryInfo.pagenum = page
      this.getOrderList()
    },
    async showEditSiteDialog(id) {
      const { data } = await this.$axios.get(`orders/${id}`)
      if (data.meta.status !== 200) {
        return this.$message.error('订单信息获取失败')
      }
      const site = data.data.consignee_addr
        ? data.data.consignee_addr.split(',')
        : []
      data.data.site2 = site.pop() || ''
      data.data.site1 = site
      this.editSiteForm = data.data
      this.editSiteDialog = true
    },
    site1Change(arr) {
      arr.length && this.$refs.editSiteRef.clearValidate('site1')
    },
    numberChange(msg) {
      this.$refs.editSiteRef.clearValidate(msg)
    },
    closeEditSiteDialog() {
      this.$refs.editSiteRef.resetFields()
      this.editSiteForm.site1 = []
    },
    editSite() {
      this.$refs.editSiteRef.validate(async (valid) => {
        if (!valid) return
        const editSiteForm = _.cloneDeep(this.editSiteForm)
        const { site1, site2 } = editSiteForm
        const site = [...site1, site2]
        editSiteForm.consignee_addr = site.join()
        editSiteForm.pay_status = editSiteForm.order_pay === '0' ? '0' : '1'
        delete editSiteForm.site1
        delete editSiteForm.site2
        const { data } = await this.$axios.put(
          `orders/${editSiteForm.order_id}`,
          editSiteForm
        )
        if (data.meta.status !== 201) return this.$message.error('修改订单失败')
        this.$message.success('修改订单成功')
        this.editSiteDialog = false
        this.getOrderList()
      })
    },
    async showProgressDialog() {
      const { data } = await this.$axios.get('/kuaidi/1106975712662')
      if (data.meta.status !== 200) {
        return this.$message.error('物流进度获取失败')
      }
      this.progressList = data.data
      this.progressDialog = true
    },
  },
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
