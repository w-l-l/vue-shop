<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入用户名称关键字"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#">
          <template slot-scope="scope">{{
            (queryInfo.pagenum - 1) * queryInfo.pagesize + scope.$index + 1
          }}</template>
        </el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="saveUserState(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delUserById(scope.row.id)"
            ></el-button>
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="sizeChange"
        @current-change="currentChange"
      >
      </el-pagination>
    </el-card>
    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      width="50%"
      @close="closeDialog"
    >
      <el-form
        ref="addUserRef"
        :model="addUserInfo"
        :rules="addUserRules"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserInfo.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserInfo.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserInfo.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserInfo.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="修改用户"
      :visible.sync="dialogVisibleEdit"
      width="50%"
      @close="closeEditDialog"
    >
      <el-form
        :model="userInfo"
        :rules="editInfoRules"
        ref="editInfoRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="userInfo.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userInfo.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="userInfo.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleEdit = false">取 消</el-button>
        <el-button type="primary" @click="edituser">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="分配角色"
      :visible.sync="dialogVisibleRole"
      width="50%"
      @close="closeRoleDialog"
    >
      <p>当前的用户：{{ userInfo.username }}</p>
      <p>当前的角色：{{ userInfo.role_name }}</p>
      <p>
        分配新角色：
        <el-select v-model="selectRole" placeholder="请选择角色">
          <el-option
            v-for="item in roleInfo"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleRole = false">取 消</el-button>
        <el-button type="primary" @click="setUserRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    const validEmail = (rule, value, callback) => {
      const emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      emailReg.test(value)
        ? callback()
        : callback(new Error('请输入合法的邮箱'))
    }
    const validMobile = (rule, value, callback) => {
      const mobileReg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      mobileReg.test(value)
        ? callback()
        : callback(new Error('请输入合法的手机号'))
    }
    const emailMobileReg = {
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { validator: validEmail, trigger: 'blur' },
      ],
      mobile: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { validator: validMobile, trigger: 'blur' },
      ],
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2,
      },
      userList: [],
      total: 0,
      dialogVisible: false,
      addUserInfo: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
        ...emailMobileReg,
      },
      dialogVisibleEdit: false,
      userInfo: {},
      editInfoRules: emailMobileReg,
      dialogVisibleRole: false,
      roleInfo: [],
      selectRole: '',
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data } = await this.$axios.get('users', {
        params: this.queryInfo,
      })
      if (data.meta.status !== 200) {
        return this.$message.error('用户列表获取失败')
      }
      this.userList = data.data.users
      this.total = data.data.total
    },
    sizeChange(size) {
      this.queryInfo.pagesize = size
      this.getUserList()
    },
    currentChange(page) {
      this.queryInfo.pagenum = page
      this.getUserList()
    },
    async saveUserState(userInfo) {
      const { data } = await this.$axios.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      data.meta.status === 200
        ? this.$message.success('用户状态设置成功')
        : this.$message.error('用户状态设置失败')
    },
    closeDialog() {
      this.$refs.addUserRef.resetFields()
    },
    addUser() {
      this.$refs.addUserRef.validate(async (valid) => {
        if (!valid) return
        const { data } = await this.$axios.post('users', this.addUserInfo)
        if (data.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        this.dialogVisible = false
        this.getUserList()
      })
    },
    async getUserInfo(id) {
      const { data } = await this.$axios.get(`users/${id}`)
      if (data.meta.status !== 200) {
        return this.$message.error('用户信息获取失败')
      }
      this.userInfo = data.data
    },
    async showEditDialog(id) {
      if (await this.getUserInfo(id)) return
      this.dialogVisibleEdit = true
    },
    closeEditDialog() {
      this.$refs.editInfoRef.resetFields()
      this.userInfo = {}
    },
    edituser() {
      this.$refs.editInfoRef.validate(async (valid) => {
        if (!valid) return
        const { id, email, mobile } = this.userInfo
        const { data } = await this.$axios.put(`users/${id}`, {
          email,
          mobile,
        })
        if (data.meta.status !== 200) {
          return this.$message.error('用户信息更新失败')
        }
        this.$message.success('用户信息更新成功')
        this.dialogVisibleEdit = false
        this.getUserList()
      })
    },
    async delUserById(id) {
      const confirm = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirm !== 'confirm') return this.$message.info('已取消删除')
      const { data } = await this.$axios.delete(`users/${id}`)
      if (data.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('删除用户成功')
      this.getUserList()
    },
    async showRoleDialog(userInfo) {
      if (await this.getUserInfo(userInfo.id)) return
      this.userInfo = { ...this.userInfo, role_name: userInfo.role_name }
      const { data } = await this.$axios.get('roles')
      if (data.meta.status !== 200) {
        return this.$message.error('角色信息获取失败')
      }
      this.roleInfo = data.data
      this.dialogVisibleRole = true
    },
    async setUserRole() {
      const { data } = await this.$axios.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectRole,
      })
      if (data.meta.status !== 200) return this.$message.error('更新角色失败')
      this.$message.success('更新角色成功')
      this.getUserList()
      this.dialogVisibleRole = false
    },
    closeRoleDialog() {
      this.selectRole = ''
      this.userInfo = {}
    },
  },
}
</script>
