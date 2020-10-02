<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="dialogVisibleRole = true"
        >添加角色</el-button
      >
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item, index) in scope.row.children"
              :key="item.id"
              :class="['bottom-border', { 'top-border': !index }, 'tag-center']"
            >
              <el-col :span="5" class="tag-center">
                <el-tag closable @close="delRoleRight(scope.row, item.id)">{{
                  item.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(item, index) in item.children"
                  :key="item.id"
                  :class="{ 'top-border': index, 'tag-center': true }"
                >
                  <el-col :span="6" class="tag-center">
                    <el-tag
                      type="success"
                      closable
                      @close="delRoleRight(scope.row, item.id)"
                      >{{ item.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      closable
                      v-for="item in item.children"
                      :key="item.id"
                      @close="delRoleRight(scope.row, item.id)"
                      >{{ item.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRoleDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delRole(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="setRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      title="分配权限"
      :visible.sync="dialogVisibleRight"
      width="50%"
      @close="closeRight"
    >
      <el-tree
        :data="rightTree"
        show-checkbox
        node-key="id"
        :props="defaultProps"
        default-expand-all
        :default-checked-keys="defaultCheckedKeys"
        ref="rightRef"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleRight = false">取 消</el-button>
        <el-button type="primary" @click="setRoleRight">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="添加角色"
      :visible.sync="dialogVisibleRole"
      width="50%"
      @close="closeRole"
    >
      <el-form
        :model="addRoleFrom"
        :rules="roleRule"
        ref="addRoleRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleFrom.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleFrom.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleRole = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="修改角色"
      :visible.sync="dialogVisibleRoleEdit"
      width="50%"
      @close="closeRoleEdit"
    >
      <el-form
        :model="editRoleFrom"
        :rules="roleRule"
        ref="editRoleRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleFrom.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRoleFrom.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleRoleEdit = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      dialogVisibleRight: false,
      rightTree: [],
      defaultProps: {
        label: 'authName',
        children: 'children',
      },
      defaultCheckedKeys: [],
      roleId: '',
      dialogVisibleRole: false,
      addRoleFrom: {
        roleName: '',
        roleDesc: '',
      },
      roleRule: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
        ],
      },
      dialogVisibleRoleEdit: false,
      editRoleFrom: {},
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const { data } = await this.$axios.get('roles')
      if (data.meta.status !== 200) {
        return this.$message.error('角色列表获取失败')
      }
      this.roleList = data.data
    },
    async delRoleRight(role, rightId) {
      const confirm = await this.$confirm(
        '此操作将删除该用户权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirm === 'cancel') return this.$message.info('已取消删除')
      const { data } = await this.$axios.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (data.meta.status !== 200) return this.$message.error('删除权限失败')
      this.$message.success('删除权限成功')
      role.children = data.data
    },
    async setRightDialog(role) {
      this.roleId = role.id
      const { data } = await this.$axios.get('rights/tree')
      if (data.meta.status !== 200) {
        return this.$message.error('权限数据获取失败')
      }
      this.rightTree = data.data
      this.getDefaultCheckedKeys(role)
      this.dialogVisibleRight = true
    },
    getDefaultCheckedKeys(role) {
      if (!role.children) return this.defaultCheckedKeys.push(role.id)
      role.children.forEach((item) => this.getDefaultCheckedKeys(item))
    },
    closeRight() {
      this.defaultCheckedKeys = []
    },
    async setRoleRight() {
      const rids = [
        ...this.$refs.rightRef.getHalfCheckedKeys(),
        ...this.$refs.rightRef.getCheckedKeys(),
      ].join(',')
      const { data } = await this.$axios.post(`roles/${this.roleId}/rights`, {
        rids,
      })
      if (data.meta.status !== 200) return this.$message.error('权限分配失败')
      this.$message.success('权限分配成功')
      this.getRoleList()
      this.dialogVisibleRight = false
    },
    closeRole() {
      this.$refs.addRoleRef.resetFields()
      this.addRoleFrom.roleDesc = ''
    },
    addRole() {
      this.$refs.addRoleRef.validate(async (valid) => {
        if (!valid) return
        const { data } = await this.$axios.post('roles', this.addRoleFrom)
        if (data.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('添加角色成功')
        this.getRoleList()
        this.dialogVisibleRole = false
      })
    },
    async showEditRoleDialog(roleId) {
      const { data } = await this.$axios.get(`roles/${roleId}`)
      if (data.meta.status !== 200) {
        return this.$message.error('角色信息获取失败')
      }
      this.editRoleFrom = data.data
      this.dialogVisibleRoleEdit = true
    },
    closeRoleEdit() {
      this.$refs.editRoleRef.resetFields()
      this.editRoleFrom = {}
    },
    editRole() {
      this.$refs.editRoleRef.validate(async (valid) => {
        if (!valid) return
        const { roleName, roleDesc } = this.editRoleFrom
        const { data } = await this.$axios.put(
          `roles/${this.editRoleFrom.roleId}`,
          {
            roleName,
            roleDesc,
          }
        )
        if (data.meta.status !== 200) return this.$message.error('修改角色失败')
        this.$message.success('修改角色成功')
        this.getRoleList()
        this.dialogVisibleRoleEdit = false
      })
    },
    async delRole(id) {
      const confirm = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirm === 'cancel') return this.$message.info('已取消删除')
      const { data } = await this.$axios.delete(`roles/${id}`)
      if (data.meta.status !== 200) return this.$message.error('删除角色失败')
      this.$message.success('删除角色成功')
      this.getRoleList()
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bottom-border {
  border-bottom: 1px solid #eee;
}
.top-border {
  border-top: 1px solid #eee;
}
.tag-center {
  display: flex;
  align-items: center;
}
</style>
