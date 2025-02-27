<template>
  <div class="page-container">
    <h1>用户管理</h1>
    <hr />
    <el-form :model="userForm" label-width="100px" class="user-form">
      <el-form-item label="" class="avatar-item">
        <div class="avatar-uploader">
          <div v-if="userForm.avatar" class="avatar-wrapper">
            <img :src="userForm.avatar" class="avatar" @click="triggerFileInput" />
            <div class="avatar-hover-text">点击修改</div>
            <el-button
                type="danger"
                size="small"
                class="remove-avatar-btn"
                @click="removeAvatar"
            >
              删除
            </el-button>
          </div>
          <div v-else class="avatar-uploader-icon" @click="triggerFileInput">
            <el-icon><Plus /></el-icon>
          </div>
          <input
              type="file"
              ref="fileInputRef"
              style="display: none"
              accept="image/*"
              @change="handleFileChange"
          />
        </div>
      </el-form-item>

      <el-form-item label="用户名" required>
        <el-input v-model="userForm.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="电话" required>
        <el-input v-model="userForm.phone" placeholder="请输入电话" maxlength="11" />
      </el-form-item>

      <el-form-item label="旧密码">
        <el-input
            v-model="userForm.oldPassword"
            type="password"
            placeholder="请输入旧密码（修改密码时必填）"
            show-password
        />
      </el-form-item>

      <el-form-item label="新密码">
        <el-input
            v-model="userForm.newPassword"
            type="password"
            placeholder="请输入新密码（可选）"
            show-password
        />
      </el-form-item>

      <el-form-item label="确认密码">
        <el-input
            v-model="userForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码（可选）"
            show-password
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitUserInfo">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { updateUser } from '@/api/user';
import { Plus } from '@element-plus/icons-vue';
import router from '@/router';

// 获取当前用户信息
const userStore = useUserStore();
const currentUser = userStore.getUserInfo();

if (!currentUser) {
  ElMessage.error('未登录，请先登录');
  router.push('/login');
}

// 文件输入引用
const fileInputRef = ref<HTMLInputElement | null>(null);

// 用户表单数据
const userForm = ref({
  avatar: currentUser?.avatar || '',
  username: currentUser?.username || '',
  phone: currentUser?.phone || '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// 用户 ID
const userId = ref<number>(currentUser?.id || 0);

// 触发文件输入点击
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

// 验证文件
const validateFile = (file: File): boolean => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件');
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2; // 限制 2MB
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB');
    return false;
  }
  return true;
};

// 处理文件变更
const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  if (!validateFile(file)) {
    // 重置文件输入
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
    return;
  }

  try {
    console.log('开始上传文件:', file.name);

    // 创建FormData
    const formData = new FormData();
    formData.append('file', file);

    // 获取token
    const token = localStorage.getItem('satoken');

    // 使用原生fetch API直接上传
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        // 不要手动设置Content-Type，让浏览器自动处理
        // 添加token进请求头
        'satoken': token || ''
      },
      body: formData
    });

    console.log('上传状态:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`上传失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('上传响应:', result);

    if (result.code === 200) {
      userForm.value.avatar = result.data.fileUrl;
      ElMessage.success('头像上传成功');
    } else {
      throw new Error(result.message || '上传失败');
    }
  } catch (error: any) {
    console.error('头像上传失败:', error);
    ElMessage.error(`头像上传失败: ${error.message || '未知错误'}`);
  } finally {
    // 重置文件输入，允许再次选择相同文件
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
  }
};

// 删除头像
const removeAvatar = () => {
  userForm.value.avatar = '';
  ElMessage.success('头像已删除');
};

// 提交用户信息
const submitUserInfo = async () => {
  try {
    if (!userForm.value.username) {
      ElMessage.error('用户名是必填项');
      return;
    }

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!userForm.value.phone || !phoneRegex.test(userForm.value.phone)) {
      ElMessage.error('请输入有效的11位手机号码');
      return;
    }

    // 密码相关校验
    if (userForm.value.oldPassword || userForm.value.newPassword || userForm.value.confirmPassword) {
      if (!userForm.value.oldPassword) {
        ElMessage.error('请输入旧密码');
        return;
      }
      if (!userForm.value.newPassword) {
        ElMessage.error('请输入新密码');
        return;
      }
      if (!userForm.value.confirmPassword) {
        ElMessage.error('请再次输入新密码');
        return;
      }
      if (userForm.value.newPassword !== userForm.value.confirmPassword) {
        ElMessage.error('两次输入的新密码不一致');
        return;
      }
      if (userForm.value.newPassword.length < 6) {
        ElMessage.error('新密码长度需至少6位');
        return;
      }
    }

    // 构建提交数据
    const submitData = {
      avatar: userForm.value.avatar || '', // 使用 fileUrl 或空字符串
      username: userForm.value.username,
      phone: userForm.value.phone,
      ...(userForm.value.newPassword && {
        oldPassword: userForm.value.oldPassword,
        password: userForm.value.newPassword,
      }),
    };

    console.log('提交用户数据:', submitData);

    // 调用 updateUser 更新用户信息和密码
    const response = await updateUser(userId.value, submitData);
    console.log('更新用户响应:', response);

    // 更新本地存储的用户信息
    userStore.setUserInfo({
      ...currentUser,
      id: userId.value,
      username: userForm.value.username,
      avatar: userForm.value.avatar || '',
      phone: userForm.value.phone,
    });

    ElMessage.success('用户信息更新成功');
    if (userForm.value.newPassword) {
      ElMessage.success('密码已更新，请重新登录');
      userStore.clearUserInfo();
      router.push('/login');
    }
  } catch (error: any) {
    console.error('更新用户信息失败:', error);
    ElMessage.error(`更新失败: ${error.message || '请稍后重试'}`);
  }
};

// 重置表单
const resetForm = () => {
  userForm.value = {
    avatar: currentUser?.avatar || '',
    username: currentUser?.username || '',
    phone: currentUser?.phone || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
}

.user-form {
  margin-top: 20px;
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.avatar-item {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 20px;
}

.avatar-uploader {
  border-radius: 6px;
  width: 120px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
  border: 2px dashed #dcdfe6;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.3s, opacity 0.3s;
}

.avatar:hover {
  opacity: 0.8;
  transform: scale(1.1); /* 放大效果 */
  transform-origin: center; /* 从中心放大 */
}

.avatar-hover-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.avatar:hover + .avatar-hover-text {
  opacity: 1;
}

.remove-avatar-btn {
  position: absolute;
  top: 5px;
  right: -50px;
  padding: 5px 10px;
  font-size: 12px;
}

h1 {
  margin-bottom: 20px;
}

hr {
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
}
</style>