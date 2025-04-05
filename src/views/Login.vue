<template>
  <div class="outer-container">
    <!-- 登录表单 -->
    <div class="login-container" v-if="currentForm === 'login'">
      <h1>Login</h1>
      <form class="login-form" @submit.prevent="handleLogin">
        <input
            v-model="loginForm.username"
            type="text"
            placeholder="Username"
            class="rounded-input"
            required
        />
        <input
            v-model="loginForm.password"
            type="password"
            placeholder="Password"
            class="rounded-input"
            required
        />
        <div class="forgot-password">
          <a href="#" @click.prevent="currentForm = 'forgot'">Forgot Password?</a>
        </div>
        <div class="button-container">
          <button type="submit" class="rounded-button">Login</button>
          <button
              type="button"
              class="rounded-button register-button"
              @click="currentForm = 'register'"
          >
            Register
          </button>
        </div>
      </form>
    </div>

    <!-- 注册表单 -->
    <div class="login-container" v-if="currentForm === 'register'">
      <button class="back-button" @click="currentForm = 'login'">Back</button>
      <h1>Register</h1>
      <form class="login-form" @submit.prevent="handleRegister">
        <input
            v-model="registerForm.username"
            type="text"
            placeholder="Username"
            class="rounded-input"
            required
        />
        <input
            v-model="registerForm.password"
            type="password"
            placeholder="Password"
            class="rounded-input"
            required
        />
        <input
            v-model="registerForm.phone"
            type="tel"
            placeholder="Phone"
            class="rounded-input"
            maxlength="11"
            required
        />
        <div class="button-container">
          <button type="submit" class="rounded-button">Complete</button>
        </div>
      </form>
    </div>

    <!-- 忘记密码表单 -->
    <div class="login-container" v-if="currentForm === 'forgot'">
      <button class="back-button" @click="currentForm = 'login'">Back</button>
      <h1>Reset Password</h1>
      <form class="login-form" @submit.prevent="handleResetPassword">
        <input
            v-model="resetForm.username"
            type="text"
            placeholder="Username"
            class="rounded-input"
            required
        />
        <input
            v-model="resetForm.phone"
            type="tel"
            placeholder="Phone"
            class="rounded-input"
            maxlength="11"
            required
        />
        <input
            v-model="resetForm.newPassword"
            type="password"
            placeholder="New Password"
            class="rounded-input"
            required
        />
        <div class="button-container">
          <button type="submit" class="rounded-button">Complete</button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { loginService, registerService, resetPasswordService } from '@/api/auth';
import type { LoginRequest, RegisterRequest, ResetPasswordRequest } from '@/types/interfaces';
import router from '@/router';
import { ElMessage } from 'element-plus';

// 表单状态
const currentForm = ref<'login' | 'register' | 'forgot'>('login');

// 登录表单数据
const loginForm = ref<LoginRequest>({
  username: '',
  password: '',
});

// 注册表单数据
const registerForm = ref<RegisterRequest>({
  username: '',
  password: '',
  phone: '',
});

// 重置密码表单数据
const resetForm = ref<ResetPasswordRequest>({
  username: '',
  phone: '',
  newPassword: '',
});

// 使用 Pinia Store
const userStore = useUserStore();

// 处理登录
const handleLogin = async () => {
  try {
    // 基本验证
    if (!loginForm.value.username) {
      ElMessage.error('用户名不能为空');
      return;
    }
    if (!loginForm.value.password) {
      ElMessage.error('密码不能为空');
      return;
    }

    // 发送登录请求
    console.log('正在尝试登录...', loginForm.value);
    const response = await loginService(loginForm.value);
    console.log('登录响应:', response);

    // 从响应头中获取 satoken
    console.log('所有响应头:', response.headers);
    console.log('当前 cookie:', document.cookie);

    // 从 cookie 中获取 satoken (如果存在)
    const cookieMatch = document.cookie.match(/satoken=([^;]+)/);
    let saToken = cookieMatch ? cookieMatch[1] : '';
    console.log('从 cookie 中提取的 satoken:', saToken);
    localStorage.setItem('satoken', saToken);
    
    // 同时保存token用于配送系统API调用
    localStorage.setItem('token', saToken);
    userStore.setToken(saToken);

    // 从响应体获取用户信息
    if (response.data.code === 200) {
      const userData = response.data.data;
      console.log('获取到的用户数据:', userData);

      if (!userData) {
        throw new Error('用户信息未返回');
      }

      // 检查用户数据中是否包含角色信息
      if (!userData.role_key) {
        console.warn('警告: 用户数据中缺少 role_key 字段');
      }

      // 保存到用户状态
      userStore.setUserInfo({
        id: userData.id,
        username: userData.username,
        avatar: userData.avatar || '',
        phone: userData.phone || '',
        role_key: userData.role_key || '',
      });

      // 验证保存是否成功
      const savedUser = userStore.getUserInfo();
      console.log('保存到 store 后的用户信息:', savedUser);

      // 验证 localStorage 是否保存成功
      console.log('localStorage 中的用户信息:', localStorage.getItem('userInfo'));

      ElMessage.success('登录成功');
      router.push('/dashboard');
    } else {
      throw new Error(response.data.message || '登录失败');
    }
  } catch (error) {
    console.error('登录失败:', error);
    const errorMsg = error.response?.data?.message || error.message || '登录失败，请检查用户名或密码';
    ElMessage.error(errorMsg);
  }
};

// 处理注册
const handleRegister = async () => {
  try {
    if (!registerForm.value.username) {
      ElMessage.error('用户名是必填项');
      return;
    }
    if (!registerForm.value.password || registerForm.value.password.length < 6) {
      ElMessage.error('密码长度需至少6位');
      return;
    }
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!registerForm.value.phone || !phoneRegex.test(registerForm.value.phone)) {
      ElMessage.error('请输入有效的11位手机号码');
      return;
    }

    console.log('正在尝试注册...', registerForm.value);
    const response = await registerService(registerForm.value);
    console.log('注册响应:', response);

    ElMessage.success('注册成功，请登录');
    currentForm.value = 'login';
    registerForm.value = { username: '', password: '', phone: '' };
  } catch (error: any) {
    console.error('注册失败:', error);
    const errorMsg = error.response?.data?.message || (error as Error).message || '注册失败，请稍后重试';
    ElMessage.error(errorMsg);
  }
};

// 处理重置密码
const handleResetPassword = async () => {
  try {
    if (!resetForm.value.username) {
      ElMessage.error('用户名是必填项');
      return;
    }
    if (!resetForm.value.phone) {
      ElMessage.error('手机号是必填项');
      return;
    }
    if (!resetForm.value.newPassword || resetForm.value.newPassword.length < 6) {
      ElMessage.error('新密码长度需至少6位');
      return;
    }

    console.log('正在尝试重置密码...', resetForm.value);
    const response = await resetPasswordService(resetForm.value);
    console.log('重置密码响应:', response);

    ElMessage.success('密码重置成功，请登录');
    currentForm.value = 'login';
    resetForm.value = { username: '', phone: '', newPassword: '' };
  } catch (error: any) {
    console.error('重置密码失败:', error);
    const errorMsg = error.response?.data?.message || error.message || '重置密码失败，请稍后重试';
    ElMessage.error(errorMsg);
  }
};
</script>

<style scoped>
/* 样式保持不变 */
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
  position: relative;
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