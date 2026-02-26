<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="aside">
      <div class="logo">CRM系统</div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/customer">
          <el-icon><User /></el-icon>
          <span>客户管理</span>
        </el-menu-item>
        <el-menu-item index="/product">
          <el-icon><Goods /></el-icon>
          <span>产品管理</span>
        </el-menu-item>
        <el-menu-item index="/category">
          <el-icon><Menu /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/order">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/member-level">
          <el-icon><Medal /></el-icon>
          <span>会员等级</span>
        </el-menu-item>
        <el-menu-item index="/coupon">
          <el-icon><Ticket /></el-icon>
          <span>优惠券管理</span>
        </el-menu-item>
        <el-menu-item index="/lottery">
          <el-icon><Present /></el-icon>
          <span>抽奖管理</span>
        </el-menu-item>
        <el-menu-item index="/activity">
          <el-icon><Trophy /></el-icon>
          <span>活动管理</span>
        </el-menu-item>
        <el-menu-item index="/statistics">
          <el-icon><TrendCharts /></el-icon>
          <span>数据统计</span>
        </el-menu-item>
        <el-menu-item index="/audit-log">
          <el-icon><Document /></el-icon>
          <span>审计日志</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><Avatar /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/role">
          <el-icon><UserFilled /></el-icon>
          <span>角色管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="menu-icon" @click="toggleSidebar">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <el-icon><UserFilled /></el-icon>
              管理员
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const isCollapse = ref(false);

const activeMenu = computed(() => route.path);

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value;
};

const handleCommand = (command: string) => {
  if (command === 'logout') {
    localStorage.removeItem('token');
    router.push('/login');
  }
};
</script>

<style lang="scss" scoped>
.layout-container {
  width: 100%;
  height: 100vh;
}

.aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;

  .logo {
    height: 60px;
    line-height: 60px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    border-bottom: 1px solid #1f2d3d;
  }

  .el-menu {
    border-right: none;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;

  .header-left {
    .menu-icon {
      font-size: 20px;
      cursor: pointer;
    }
  }

  .header-right {
    .el-dropdown-link {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
  }
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
