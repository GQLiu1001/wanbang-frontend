<template>
  <div class="outer-container">
    <div class="login-container">
      <h1>Login</h1>
      <!--        先阻止默认表单提交行为-->
      <form class="login-form" @submit.prevent="handleLogin">
        <input type="text" placeholder="Username" class="rounded-input" />
        <input type="password" placeholder="Password" class="rounded-input" />
        <div class="button-container">
          <button type="submit" class="rounded-button">Login</button>
          <button type="button" class="rounded-button register-button">Register</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from "@/router";
function handleLogin() {
  router.push('/home');
}
</script>

<style scoped>
/* :host 是Vue组件的根元素选择器，影响整个组件的外部容器 */
:host {
  display: block; /* 确保组件以块级元素显示 */
  margin: 0; /* 移除默认外边距 */
  padding: 0; /* 移除默认内边距 */
  height: 100vh; /* 设置组件高度为视口高度，确保填满屏幕 */
  width: 100vw; /* 设置组件宽度为视口宽度，确保填满屏幕 */
  overflow: hidden; /* 隐藏任何超出部分，防止滚动条出现 */
}

.outer-container {
  height: 100%; /* 继承:host的高度，完全填充父容器 */
  width: 100%; /* 继承:host的宽度，完全填充父容器 */
  display: flex; /* 使用flex布局来居中子元素 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'); /* 背景图片 */
  background-size: cover; /* 背景图片覆盖整个容器 */
  background-position: center; /* 背景图片居中 */
  background-repeat: no-repeat; /* 背景不重复 */
  overflow: hidden; /* 防止容器内部溢出导致滚动条 */
  margin: 0; /* 移除外边距 */
  padding: 0; /* 移除内边距 */
  position: fixed; /* 固定位置，相对于视口，确保不随内容滚动 */
  top: 0; /* 固定到顶部 */
  left: 0; /* 固定到左侧 */
}

.login-container {
  background: rgba(255, 255, 255, 0.9); /* 半透明白色背景 */
  padding: 2rem 3rem; /* 内边距，上下2rem，左右3rem */
  border-radius: 15px; /* 圆角边框 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  backdrop-filter: blur(5px); /* 背景模糊效果 */
  width: 100%; /* 宽度100%，但有max-width限制 */
  max-width: 400px; /* 最大宽度400px */
  margin: 0; /* 移除外边距，避免额外空间 */
  overflow: hidden; /* 防止内部内容溢出 */
}

h1 {
  text-align: center; /* 标题居中 */
  margin-bottom: 2rem; /* 下方间隔 */
  color: #333; /* 文字颜色 */
}

.login-form {
  display: flex; /* 表单使用flex布局 */
  flex-direction: column; /* 垂直排列子元素 */
  gap: 1rem; /* 子元素间距 */
  margin: 0; /* 移除外边距 */
  padding: 0; /* 移除内边距 */
}
/* 新增按钮容器，使用flex布局让按钮水平排列并平分空间 */
.button-container {
  display: flex; /* 使用flex布局 */
  gap: 1rem; /* 按钮之间的间距 */
  justify-content: space-between; /* 按钮平分空间 */
}
.rounded-input {
  padding: 0.75rem 1rem; /* 内边距 */
  border: 1px solid #ddd; /* 边框 */
  border-radius: 25px; /* 圆角 */
  font-size: 1rem; /* 字体大小 */
  outline: none; /* 移除默认聚焦边框 */
  transition: border-color 0.3s ease; /* 边框颜色过渡动画 */
  width: 100%; /* 宽度充满容器 */
  box-sizing: border-box; /* 确保padding包含在宽度计算内 */
}

.rounded-input:focus {
  border-color: #007bff; /* 聚焦时边框颜色 */
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2); /* 聚焦时阴影 */
}

.rounded-button {
  padding: 0.75rem 1rem; /* 内边距 */
  border: none; /* 无边框 */
  border-radius: 25px; /* 圆角 */
  background-color: #007bff; /* 背景颜色 */
  color: white; /* 文字颜色 */
  font-size: 1rem; /* 字体大小 */
  cursor: pointer; /* 鼠标悬停时显示手型 */
  transition: background-color 0.3s ease; /* 背景颜色过渡动画 */
  width: 100%; /* 宽度充满容器 */
  box-sizing: border-box; /* 确保padding包含在宽度计算内 */
  flex: 1; /* 让按钮平分可用空间 */
}
/* 可选：为Register按钮添加不同样式以区分 */
.register-button {
  background-color: #5228a7; /* 绿色背景区分Login按钮 */
}
.rounded-button:hover {
  background-color: #0056b3; /* 悬停时颜色加深 */
}
</style>