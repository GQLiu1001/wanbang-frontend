<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUsers, deleteUser } from '@/api/user';
import type {User, PaginationParams, UserList} from '@/types/api';
import { useUserStore } from '@/stores/user';

// Store user list and pagination state
const userList = ref<UserList[]>([]);
const page = ref(1);
const size = ref(10);
const total = ref(0);

// 获取当前用户信息
const userStore = useUserStore();
const currentUser = userStore.getUserInfo();

// 判断当前用户是否有删除权限
const hasDeletePermission = () => {
  const currentUser = userStore.getUserInfo();
  return currentUser?.role_key === 'admin';
};

// Fetch user list with pagination
const fetchUserList = async () => {
  try {
    const params: PaginationParams = {
      page: page.value,
      size: size.value,
    };

    const response = await getUsers(params);
    const data = response.data;
    if (data.code === 200 && data.data?.items) {
      userList.value = data.data.items;
      total.value = data.data.total || 0;
    } else {
      throw new Error('数据格式异常');
    }
  } catch (error) {
    console.error('Failed to fetch user list:', error);
    ElMessage.error('获取用户列表失败，请稍后重试');
  }
};

// 删除用户
const handleDelete = async (userId: number, username: string) => {
  if (!hasDeletePermission()) {
    ElMessage.error('无权限执行删除操作');
    return;
  }

  try {
    await ElMessageBox.confirm(
        `确定要删除用户 "${username}" 吗？此操作不可恢复！`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    );

    const response = await deleteUser(userId);
    if (response.data.code === 200) {
      ElMessage.success('删除成功');
      await fetchUserList();
    } else {
      throw new Error(response.data.message || '删除失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete user:', error);
      ElMessage.error(error.message || '删除用户失败，请稍后重试');
    }
  }
};

// Pagination handlers
const handlePageChange = (newPage: number) => {
  page.value = newPage;
  fetchUserList();
};

const handleSizeChange = (newSize: number) => {
  size.value = newSize;
  page.value = 1;
  fetchUserList();
};

onMounted(() => {
  fetchUserList();
});
</script>

<template>
  <div class="page-container">
    <h1>用户管理</h1>
    <hr>

    <!-- 用户列表 -->
    <div class="user-list-container">
      <h2>所有用户</h2>
      <el-table :data="userList" style="width: 100%">
        <!-- Remove fixed widths and let columns distribute evenly -->
        <el-table-column prop="id" label="用户id" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="role_key" label="角色标识" />
        <el-table-column prop="description" label="角色描述" />
        <el-table-column label="操作" v-if="hasDeletePermission()">
          <template #default="{ row }">
            <el-button
                type="danger"
                size="small"
                @click="handleDelete(row.id, row.username)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
            :current-page="page"
            :page-size="size"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.user-list-container {
  width: 900px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

h2 {
  margin-bottom: 15px;
}

hr {
  width: 100%;
  max-width: 700px;
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-bottom: 20px;
}

/* Ensure table columns are evenly spaced */
.el-table th, .el-table td {
  text-align: center; /* Center-align text for better appearance */
}

.el-table .el-table__cell {
  padding: 10px; /* Adjust padding for consistency */
}
</style>