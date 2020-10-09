<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ titleText }}商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        :title="`${titleText}商品信息`"
        type="info"
        center
        show-icon
        :closable="false"
      ></el-alert>
      <el-steps :active="activeStep >> 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        :model="addGoodForm"
        :rules="addGoodFormRule"
        ref="addGoodFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          tab-position="left"
          v-model="activeStep"
          :before-leave="beforeActiveTabs"
          @tab-click="tabsClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input-number
                v-model="addGoodForm.goods_price"
                :min="1"
                :precision="2"
                @change="numberChange('goods_price')"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input-number
                v-model="addGoodForm.goods_weight"
                :min="0"
                :precision="2"
                @change="numberChange('goods_weight')"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input-number
                v-model="addGoodForm.goods_number"
                :min="1"
                :precision="0"
                @change="numberChange('goods_number')"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="cateSelectChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in manyList"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-checkbox-group v-model="item.attr_checkbox">
                <el-checkbox
                  v-for="(item, index) in item.attr_vals"
                  :key="index"
                  :label="item"
                  border
                  size="medium"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyList"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="imgUploadUrl"
              :on-success="imgSuccess"
              :on-remove="imgRemove"
              :on-preview="imgPreview"
              list-type="picture"
              :file-list="fileList"
              :headers="imgUploadUrlHeader"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="add_good_btn" @click="addEditGood"
              >{{ titleText }}商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog title="图片预览" :visible.sync="previewDialog" width="50%">
      <img :src="previewUrl" class="img_preview" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeStep: '0',
      cateList: [],
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
      },
      addGoodForm: {
        goods_name: '',
        goods_price: 1,
        goods_weight: 0,
        goods_number: 1,
        goods_cat: [],
        attrs: [],
        pics: [],
        goods_introduce: '',
      },
      addGoodFormRule: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' },
        ],
      },
      manyList: [],
      onlyList: [],
      imgUploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      imgUploadUrlHeader: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      fileList: [],
      previewDialog: false,
      previewUrl: '',
    }
  },
  created() {
    this.getCateList()
    if (this.goodId) this.getGoodInfo()
  },
  computed: {
    cateId() {
      return this.addGoodForm.goods_cat[2] || null
    },
    titleText() {
      return this.goodId ? '修改' : '添加'
    },
    goodId() {
      return this.$route.params.id
    },
  },
  watch: {
    goodId() {
      this.getGoodInfo()
    },
  },
  methods: {
    async getGoodInfo() {
      const { data } = await this.$axios.get(`goods/${this.goodId}`)
      if (data.meta.status !== 200) {
        return this.$message.error('商品信息获取失败')
      }
      const info = data.data
      info.goods_cat = info.goods_cat.split(',').map((item) => item >> 0)
      const manyList = {}
      const onlyList = []
      info.attrs.forEach((item) => {
        if (item.attr_sel === 'many') {
          item.attr_value = item.attr_value ? item.attr_value.split(',') : []
          manyList[item.attr_id] = item
        } else if (item.attr_sel === 'only') {
          item.attr_vals = item.attr_value
          onlyList.push(item)
        }
      })
      info.manyList = manyList
      info.onlyList = onlyList
      info.pics.forEach((item) => {
        this.fileList.push({
          picId: item.pics_id,
          name: item.pics_big_url.slice(-10),
          url: item.pics_big_url,
        })
        this.addGoodForm.pics.push(item)
      })
      this.addGoodForm = info
    },
    async getCateList() {
      const { data } = await this.$axios.get('categories')
      if (data.meta.status !== 200) {
        return this.$message.error('商品分类信息获取失败')
      }
      this.cateList = data.data
    },
    cateSelectChange(arr) {
      if (arr.length !== 3) {
        this.addGoodForm.goods_cat = []
      }
    },
    beforeActiveTabs(activeName, oldActiveName) {
      if (!this.cateId && oldActiveName === '0') {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    numberChange(msg) {
      this.$refs.addGoodFormRef.clearValidate(msg)
    },
    tabsClick() {
      const getAttrFn = async (sel, msg, callback) => {
        const { data } = await this.$axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel },
          }
        )
        if (data.meta.status !== 200) {
          return this.$message.error(`商品${msg}获取失败`)
        }
        callback(data.data)
      }
      if (
        this.activeStep === '1' &&
        (!this.manyList.length || this.cateId !== this.manyList[0].cat_id)
      ) {
        getAttrFn('many', '参数', (data) => {
          data.forEach((item) => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
            item.attr_checkbox = this.goodId
              ? this.addGoodForm.manyList[item.attr_id]?.attr_value || []
              : [...item.attr_vals]
          })
          this.manyList = data
        })
      } else if (
        this.activeStep === '2' &&
        (!this.onlyList.length || this.cateId !== this.onlyList[0].cat_id)
      ) {
        getAttrFn(
          'only',
          '属性',
          (data) =>
            (this.onlyList =
              data[0].cat_id === this.addGoodForm.cat_id &&
              this.addGoodForm.onlyList.length
                ? this.addGoodForm.onlyList
                : data)
        )
      }
    },
    imgSuccess(info) {
      this.addGoodForm.pics.push({ pic: info.data.tmp_path })
    },
    imgRemove(info) {
      const removePath = info.picId || info.response.data.tmp_path
      const index = this.addGoodForm.pics.findIndex(
        (item) => item.pic || item.pics_id === removePath
      )
      this.addGoodForm.pics.splice(index, 1)
    },
    imgPreview(info) {
      console.log(info)
      this.previewDialog = true
      this.previewUrl = info.picId ? info.url : info.response.data.url
    },
    addGood(form) {
      this.manyList.forEach((item) => {
        form.attrs.push({
          attr_id: item.attr_id,
          attr_value: item.attr_checkbox.join(),
        })
      })
      this.onlyList.forEach((item) => {
        form.attrs.push({
          attr_id: item.attr_id,
          attr_value: item.attr_vals,
        })
      })
    },
    editGood(form) {
      const manyList = []
      const onlyList = []
      let manyArr = []
      let masnyAttr = 'attr_checkbox'
      if (this.manyList.length) {
        manyArr = this.manyList
      } else {
        manyArr = Object.values(form.manyList)
        masnyAttr = 'attr_value'
      }
      manyArr.forEach((item) => {
        manyList.push({
          attr_id: item.attr_id,
          attr_value: item[masnyAttr].join(),
        })
      })
      delete form.manyList
      ;[...(this.onlyList.length ? this.onlyList : form.onlyList)].forEach(
        (item) => {
          onlyList.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          })
        }
      )
      delete form.onlyList
      form.attrs = [...manyList, ...onlyList]
    },
    addEditGood() {
      this.$refs.addGoodFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请填写必要的表单项！')
        const addGoodForm = _.cloneDeep(this.addGoodForm)
        addGoodForm.goods_cat = addGoodForm.goods_cat.join()
        let res = 'post'
        let url = 'goods'
        let status = 201
        if (this.goodId) {
          res = 'put'
          url += `/${this.goodId}`
          status = 200
          this.editGood(addGoodForm)
        } else {
          this.addGood(addGoodForm)
        }
        const { data } = await this.$axios[res](url, addGoodForm)
        const msg = `${this.titleText}商品`
        if (data.meta.status !== status) {
          return this.$message.error(`${msg}失败`)
        }
        this.$message.success(`${msg}成功`)
        this.$router.push('/goods')
      })
    },
  },
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.img_preview {
  width: 100%;
}
.add_good_btn {
  margin-top: 15px;
}
</style>
