<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUsers, deleteUser } from '@/api/user';
import type { User, PaginationParams, UserList } from '@/types/interfaces';
import { useUserStore } from '@/stores/user';
import { useWindowSize } from '@vueuse/core'; // 导入窗口大小监听hook

// 获取窗口大小
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

// Store user list and pagination state
const userList = ref<UserList[]>([]);
const page = ref(1);
const size = ref(10);
const total = ref(0);

// 获取当前用户信息
const userStore = useUserStore();
const currentUser = ref(userStore.getUserInfo());

// 使用计算属性来判断是否有删除权限
const hasDeletePermission = computed(() => {
  const user = userStore.getUserInfo();
  console.log('权限检查 - 当前用户:', user);
  return user?.role_key === 'admin';
});

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
      // 直接使用API返回的数据，不需要额外处理
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
  if (!hasDeletePermission.value) {
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
  // 首先检查用户信息
  currentUser.value = userStore.getUserInfo();
  console.log('组件挂载 - 当前用户信息:', currentUser.value);

  // 如果没有用户信息，可以在这里添加重新获取用户信息的逻辑
  // 例如：重定向到登录页、刷新用户信息等

  // 然后获取用户列表
  fetchUserList();
});
</script>

<template>
  <div class="page-container">
    <h1>用户管理</h1>
    <hr>

    <!-- 显示当前用户信息（调试用） -->
    <div v-if="false" class="debug-info">
      <p>当前用户: {{ currentUser?.username }}</p>
      <p>角色: {{ currentUser?.role_key }}</p>
      <p>是否有删除权限: {{ hasDeletePermission }}</p>
    </div>

    <!-- 用户列表 -->
    <div class="user-list-container">
      <h2>所有用户</h2>
      <el-table :data="userList" style="width: 100%" :size="isMobile ? 'small' : 'default'">
        <el-table-column prop="id" label="用户id" :width="isMobile ? 70 : 'auto'" />
        <el-table-column prop="username" label="用户名" :width="isMobile ? 100 : 'auto'" />
        <el-table-column prop="description" label="角色描述" min-width="120" />
        <!-- 使用计算属性控制整列显示 -->
        <el-table-column label="操作" v-if="hasDeletePermission" :width="isMobile ? 80 : 120" fixed="right">
          <template #default="{ row }">
            <el-button
                type="danger"
                :size="isMobile ? 'small' : 'default'"
                @click="handleDelete(row.id, row.username)"
                class="delete-button"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
            v-if="userList && userList.length > 0"
            :current-page="page"
            :page-size="size"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
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
  width: 100%;
  align-content: center;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow-y: auto;
  overflow-x: auto;
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
  height: 100%;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .page-container {
    padding: 10px;
  }
  
  .user-list-container {
    padding: 15px 10px;
  }
  
  h1 {
    font-size: 20px;
    margin-bottom: 15px;
  }
  
  h2 {
    font-size: 16px;
    margin-bottom: 10px;
  }
  
  .delete-button {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .el-table .el-table__cell {
    padding: 5px;
  }
}
</style>