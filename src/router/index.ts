import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/Login.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    // 仓库管理
    {
      path: '/dashboard',
      redirect: '/welcome',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      children: [{
        path: '/welcome',
        name: 'welcome',
        component: () => import('../views/Welcome.vue')
      },
          {
        path: '/warehouse/list',
        name: 'warehouseList',
        component: () => import('../views/warehouse/List.vue')
      },
        // 库存管理
        {
          path: '/inventory/query',
          name: 'inventoryQuery',
          component: () => import('../views/inventory/Query.vue')
        },
        {
          path: '/inventory/inboundlist',
          name: 'inventoryInbound',
          component: () => import('../views/inventory/InboundList.vue')
        },
        {
          path: '/inventory/inboundpost',
          name: 'inventoryPost',
          component: () => import('../views/inventory/InboundPost.vue')
        },
        {
          path: '/inventory/outbound',
          name: 'inventoryOutbound',
          component: () => import('../views/inventory/Outbound.vue')
        },
        {
          path: '/inventory/transfer',
          name: 'inventoryTransfer',
          component: () => import('../views/inventory/Transfer.vue')
        },
        // 订单管理
        {
          path: '/order/orderpost',
          name: 'orderPost',
          component: () => import('../views/order/Post.vue')
        },
        {
          path: '/order/orderlist',
          name: 'orderList',
          component: () => import('../views/order/List.vue')
        },
        {
          path: '/order/aftersales',
          name: 'orderAftersales',
          component: () => import('../views/order/Aftersales.vue')
        },
        // 系统管理
        {
          path: '/system/users',
          name: 'systemUsers',
          component: () => import('../views/system/Users.vue')
        },
        {
          path: '/system/roles',
          name: 'systemRoles',
          component: () => import('../views/system/Roles.vue')
        }]
    },

  ],
})

export default router
