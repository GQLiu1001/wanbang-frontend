import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/Login.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录页面
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    // 仪表盘及子路由
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      redirect: '/dashboard/welcome', // 调整 redirect 路径与父路径一致
      children: [
        // 欢迎页面
        {
          path: 'welcome', // 相对路径，去掉前导斜杠
          name: 'welcome',
          component: () => import('@/views/Welcome.vue'),
        },
        // 仓库管理
        {
          path: 'warehouse/list', // 统一小写连字符
          name: 'warehouse-list', // 使用连字符保持一致
          component: () => import('@/views/warehouse/WarehouseList.vue'), // 组件名规范化
        },
        // 库存管理
        {
          path: 'inventory/query',
          name: 'inventory-query',
          component: () => import('@/views/inventory/InventoryQuery.vue'),
        },
        {
          path: 'inventory/inbound-list', // 调整为更清晰的命名
          name: 'inventory-inbound-list',
          component: () => import('@/views/inventory/InventoryInboundList.vue'),
        },
        {
          path: 'inventory/inbound-post',
          name: 'inventory-inbound-post',
          component: () => import('@/views/inventory/InventoryInboundPost.vue'),
        },
        {
          path: 'inventory/outbound',
          name: 'inventory-outbound',
          component: () => import('@/views/inventory/InventoryOutbound.vue'),
        },
        {
          path: 'inventory/transfer',
          name: 'inventory-transfer',
          component: () => import('@/views/inventory/InventoryTransfer.vue'),
        },
        // 订单管理
        {
          path: 'order/post',
          name: 'order-post',
          component: () => import('@/views/order/OrderPost.vue'),
        },
        {
          path: 'order/list',
          name: 'order-list',
          component: () => import('@/views/order/OrderList.vue'),
        },
        {
          path: 'order/aftersales',
          name: 'order-aftersales',
          component: () => import('@/views/order/OrderAftersales.vue'),
        },
        // 系统管理
        {
          path: 'system/users',
          name: 'system-users',
          component: () => import('@/views/system/SystemUsers.vue'),
        },
        {
          path: 'system/roles',
          name: 'system-roles',
          component: () => import('@/views/system/SystemRoles.vue'),
        },
      ],
    },
  ],
});

export default router;