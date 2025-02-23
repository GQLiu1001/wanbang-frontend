<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue';
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

// 处理头像上传
const handleAvatarUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    userForm.value.avatar = e.target?.result as string;
    ElMessage.success('头像上传成功');
  };
  reader.readAsDataURL(file);
  return false;
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

    const submitData = {
      avatar: userForm.value.avatar || undefined,
      username: userForm.value.username,
      phone: userForm.value.phone,
      ...(userForm.value.newPassword && { password: userForm.value.newPassword }),
    };

    await updateUser(userId.value, submitData);

    userStore.setUserInfo({
      id: userId.value,
      username: submitData.username,
      avatar: submitData.avatar || '',
      phone: submitData.phone,
    });

    ElMessage.success('用户信息更新成功');
    if (userForm.value.newPassword) {
      ElMessage.success('密码已更新，请重新登录');
      userStore.clearUserInfo();
      router.push('/login');
    }
  } catch (error) {
    console.error('更新用户信息失败:', error);
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

<template>
  <div class="page-container">
    <h1>用户管理</h1>
    <hr />
    <el-form :model="userForm" label-width="100px" class="user-form">
      <el-form-item label="" class="avatar-item">
        <el-upload
            class="avatar-uploader"
            action=""
            :show-file-list="false"
            :before-upload="handleAvatarUpload"
            accept="image/*"
        >
          <div v-if="userForm.avatar" class="avatar-wrapper">
            <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            <el-button
                type="danger"
                size="small"
                class="remove-avatar-btn"
                @click.stop="removeAvatar"
            >
              删除
            </el-button>
          </div>
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
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

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.user-form {
  margin-top: 20px;
  width: 500px;
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
  margin-left: 90px;
}

.avatar-uploader .el-upload {
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
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
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
  border-radius: 6px; /* 可选：添加圆角 */
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

<script lang="ts">
// 定义一个方法来检查图片 URL 是否有效
function isValidImage(url: string): boolean {
  return url.startsWith('data:image/') || url.startsWith('http://') || url.startsWith('https://');
}
</script>