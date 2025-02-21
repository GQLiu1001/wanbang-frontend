<template>
  <div class="outer-container">
    <!-- 登录表单 -->
    <div class="login-container" v-if="currentForm === 'login'">
      <h1>Login</h1>
      <form class="login-form" @submit.prevent="handleLogin">
        <input type="text" placeholder="Username" class="rounded-input" />
        <input type="password" placeholder="Password" class="rounded-input" />
        <div class="forgot-password">
          <a href="#" @click.prevent="currentForm = 'forgot'">Forgot Password?</a>
        </div>
        <div class="button-container">
          <button type="submit" class="rounded-button">Login</button>
          <button type="button" class="rounded-button register-button" @click="currentForm = 'register'">Register</button>
        </div>
      </form>
    </div>

    <!-- 注册表单 -->
    <div class="login-container" v-if="currentForm === 'register'">
      <button class="back-button" @click="currentForm = 'login'">Back</button>
      <h1>Register</h1>
      <form class="login-form" @submit.prevent>
        <input type="text" placeholder="Username" class="rounded-input" />
        <input type="password" placeholder="Password" class="rounded-input" />
        <input type="tel" placeholder="Phone" class="rounded-input" />
        <div class="button-container">
          <button type="submit" class="rounded-button">Complete</button>
        </div>
      </form>
    </div>

    <!-- 忘记密码表单 -->
    <div class="login-container" v-if="currentForm === 'forgot'">
      <button class="back-button" @click="currentForm = 'login'">Back</button>
      <h1>Reset Password</h1>
      <form class="login-form" @submit.prevent>
        <input type="text" placeholder="Username" class="rounded-input" />
        <input type="tel" placeholder="Phone" class="rounded-input" />
        <input type="password" placeholder="New Password" class="rounded-input" />
        <div class="button-container">
          <button type="submit" class="rounded-button">Complete</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from "@/router";
import { ref } from 'vue';

const currentForm = ref('login'); // 控制显示哪个表单

function handleLogin() {
  router.push('/dashboard');
}
</script>

<style scoped>
:host {
  display: block;
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.outer-container {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
}

.login-container {
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem 3rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  width: 100%;
  max-width: 400px;
  margin: 0;
  overflow: hidden;
  position: relative; /* 为返回按钮定位提供参考 */
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0;
  padding: 0;
}

.forgot-password {
  text-align: center;
  margin-bottom: 1rem;
}

.forgot-password a {
  color: #007bff;
  text-decoration: underline;
  font-size: 0.9rem;
}

.forgot-password a:hover {
  color: #0056b3;
}

.button-container {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.rounded-input {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.rounded-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}

.rounded-button {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 25px;
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
}

.register-button {
  background-color: #5228a7;
}

.rounded-button:hover {
  background-color: #0056b3;
}

/* 返回按钮样式 */
.back-button {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 25px;
  background-color: #666;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #444;
}
</style>