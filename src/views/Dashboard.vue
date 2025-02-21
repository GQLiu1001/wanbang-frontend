<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue';
import router from "@/router";
// 控制侧边栏是否折叠
const isCollapse = ref(false);
// 处理菜单点击事件
const handleMenuSelect = (index: string) => {
  console.log(`跳转到: ${index}`);
  router.push(index)
}
// 添加时间相关逻辑
const currentTime = ref(new Date().toLocaleTimeString());
let timer: number | null = null;
onMounted(() => {
  // 每秒更新时间
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString();
  }, 1000);
});
onUnmounted(() => {
  // 组件卸载时清理定时器
  if (timer) {
    clearInterval(timer);
  }
});

</script>
<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
        <div class="logo" :class="{ 'logo-collapsed': isCollapse }" @click="router.push('/welcome')">
          <el-icon class="logo-icon" ><ChromeFilled /></el-icon>
          <span v-show="!isCollapse">万邦</span>
        </div>
        <el-menu
            router
            :default-active="$route.path"
            :collapse="isCollapse"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
        >
          <!-- 仓库管理 -->
          <el-sub-menu index="1">
            <template #title>
              <el-icon><Location /></el-icon>
              <span>仓库管理</span>
            </template>
            <el-menu-item index="/warehouse/list">
              <el-icon><DocumentCopy /></el-icon>
              <template #title>仓库列表</template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 库存管理 -->
          <el-sub-menu index="2">
            <template #title>
              <el-icon><Box /></el-icon>
              <span>库存管理</span>
            </template>
            <el-menu-item index="/inventory/query">
              <el-icon><Search /></el-icon>
              <template #title>库存查询</template>
            </el-menu-item>
            <el-menu-item index="/inventory/inbound">
              <el-icon><Upload /></el-icon>
              <template #title>入库记录</template>
            </el-menu-item>
            <el-menu-item index="/inventory/outbound">
              <el-icon><Download /></el-icon>
              <template #title>出库记录</template>
            </el-menu-item>
            <el-menu-item index="/inventory/transfer">
              <el-icon><Switch /></el-icon>
              <template #title>调库记录</template>
            </el-menu-item>
          </el-sub-menu>
          <!-- 售后管理 -->
          <el-sub-menu index="3">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>订单模块</span>
            </template>
            <el-menu-item index="/order/list">
              <el-icon><FolderChecked /></el-icon>
              <template #title>订单管理</template>
            </el-menu-item>
            <el-menu-item index="/order/aftersales">
              <el-icon><Service /></el-icon>
              <template #title>售后管理</template>
            </el-menu-item>
          </el-sub-menu>
          <!-- 系统管理 -->
          <el-sub-menu index="4">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/users">
              <el-icon><User /></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>
            <el-menu-item index="/system/roles">
              <el-icon><Lock /></el-icon>
              <template #title>角色权限</template>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      <!-- 主区域 -->
      <el-container>
        <!-- 头部 -->
        <el-header class="header">
          <div class="header-left">
            <el-icon class="toggle-icon" @click="isCollapse = !isCollapse">
              <Menu />
            </el-icon>
            <span class="header-time">{{ currentTime }}</span>

          </div>
          <div class="header-right">
            <el-dropdown>
              <span class="user-info">
                <el-avatar size="small" :src="avatarUrl" />
                <span class="username">管理员</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主内容 -->
        <el-main class="main">
          <el-card class="content-card">
            <RouterView/>
          </el-card>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
/* :host 是Vue组件的根元素选择器，控制整个组件的外部容器 */
:host {
  display: block; /* 确保组件以块级元素显示 */
  margin: 0; /* 移除默认外边距 */
  padding: 0; /* 移除默认内边距 */
  height: 100vh; /* 设置高度为视口高度，确保填满屏幕 */
  width: 100vw; /* 设置宽度为视口宽度，确保填满屏幕 */
  overflow: hidden; /* 隐藏任何超出部分，防止滚动条出现 */
}

/* 整体布局容器 */
.common-layout {
  height: 100%; /* 继承:host的高度，完全填充父容器 */
  width: 100%; /* 继承:host的宽度，完全填充父容器 */
  overflow: hidden; /* 防止内部溢出导致滚动条 */
}

/* Element Plus 的容器 */
.layout-container {
  height: 100%; /* 继承父容器高度 */
  width: 100%; /* 继承父容器宽度 */
  overflow: hidden; /* 防止溢出 */
}

/* 侧边栏样式 */
.aside {
  background-color: #545c64; /* 深灰色背景 */
  transition: width 0.3s; /* 宽度变化动画 */
  overflow: hidden; /* 防止侧边栏内容溢出 */
  border-radius: 18px 0 0 18px; /* 上边和左边添加圆角 */

}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  background-color: #434a50;
  transition: all 0.3s;
  cursor: pointer; /* 添加手型指针 */
}

.logo:hover {
  background-color: #373d42; /* 悬停效果 */
}
.logo-collapsed {
  font-size: 14px; /* 折叠时缩小文字 */
}
.logo-icon {
  margin-right: 8px;
  font-size: 24px;
}

.logo-collapsed .logo-icon {
  margin-right: 0;
  font-size: 28px; /* 折叠时适当放大图标 */
}
/* 菜单样式 */
.sidebar-menu {
  border: none; /* 移除菜单边框 */
  height: calc(100% - 60px); /* 菜单占满剩余高度（减去logo高度） */
  overflow-y: auto; /* 如果菜单项过多，允许内部滚动，但外部无滚动条 */
  border-radius: 0 0 18px 0; /* 上边和左边添加圆角，与侧边栏保持一致 */
}

/* 头部样式 */
.header {
  background-color: #545c64;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px; /* 固定高度 */
  padding: 0 20px;
  overflow: hidden; /* 防止头部溢出 */
  border-radius: 0 18px 0 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-icon {
  font-size: 24px;
  cursor: pointer;
  margin-right: 20px;
  color: #e4d9d9;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  color: #e4d9d9;
}
.header-time{
  color: #e4d9d9;
}
/* 主内容样式 */
.main {
  background-color: #cac6c6; /* 浅灰色背景 */
  padding: 20px;
  overflow: auto; /* 如果内容过多，允许内部滚动，但外部无滚动条 */
  height: calc(100vh - 76px); /* 主区域占满剩余高度（减去头部高度） */
  border-radius: 0 0  18px;
}

.content-card {
  background-color: #fff;

  border-radius: 18px;
  height: 85vh;
}

/* 移除侧边栏右侧边框 */
.aside {
  border-right: none !important;
  transition: width 0.5s ease-in;
}

/* 移除菜单右侧边框 */
.el-menu {
  border-right: none !important;
}

/* 如果还有残留线条，可能是折叠动画的阴影 */
.el-menu--collapse {
  transition-duration: 0.3s;
  box-shadow: none !important;
}

.el-menu-item span,
.el-sub-menu__title span {
  transition: opacity 0.4s ease-in 0.1s;
  opacity: 1;
  visibility: visible;
  display: inline-block;
  white-space: nowrap;
  min-width: 80px;
}

.el-menu--collapse .el-menu-item span,
.el-menu--collapse .el-sub-menu__title span {
  opacity: 0;
  visibility: hidden;
  min-width: 0;
  transition: opacity 0.3s ease-in;
}



</style>}