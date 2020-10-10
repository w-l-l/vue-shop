<template>
  <el-container class="home_container">
    <el-header>
      <div>
        <img src="../assets/heima.png" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="danger" @click="logout">注销</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="collapse">|||</div>
        <el-menu :default-active="activePath" background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened :collapse="isCollapse" :collapse-transition="false" router>
          <el-submenu :index="'/' + item.path" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item :index="'/' + item.path" v-for="item in item.children" :key="item.id" @click="saveActivePath(item.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ item.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      menuList: [],
      iconObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
      this.$message.success('注销成功')
    },
    async getMenuList() {
      const { data } = await this.$axios.get('menus')
      data.meta.status === 200 ? (this.menuList = data.data) : this.$message.error(data.meta.msg)
    },
    collapse() {
      this.isCollapse = !this.isCollapse
    },
    saveActivePath(activePath) {
      activePath = `/${activePath}`
      window.sessionStorage.setItem('activePath', (this.activePath = activePath))
    }
  }
}
</script>
<style lang="less" scoped>
.home_container {
  height: 100%;
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
    .el-menu {
      border-right: none;
      .iconfont {
        margin-right: 10px;
      }
    }
    .toggle-button {
      background-color: #4a5064;
      font-size: 10px;
      line-height: 24px;
      color: #fff;
      text-align: center;
      letter-spacing: 0.2em;
      cursor: pointer;
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
}
</style>
