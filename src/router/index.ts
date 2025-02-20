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
      path: '/home',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      children: [{
        path: '/warehouse/list',
        name: 'warehouseList',
        component: () => import('../views/warehouse/List.vue')
      },
        {
          path: '/warehouse/sections',
          name: 'warehouseSections',
          component: () => import('../views/warehouse/Sections.vue')
        },
        // 库存管理
        {
          path: '/inventory/query',
          name: 'inventoryQuery',
          component: () => import('../views/inventory/Query.vue')
        },
        {
          path: '/inventory/inbound',
          name: 'inventoryInbound',
          component: () => import('../views/inventory/Inbound.vue')
        },
        {
          path: '/inventory/outbound',
          name: 'inventoryOutbound',
          component: () => import('../views/inventory/Outbound.vue')
        },
        // 订单管理
        {
          path: '/order/list',
          name: 'orderList',
          component: () => import('../views/order/List.vue')
        },
        {
          path: '/order/returns',
          name: 'orderReturns',
          component: () => import('../views/order/Returns.vue')
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
        },
        {
          path: '/system/logs',
          name: 'systemLogs',
          component: () => import('../views/system/Logs.vue')
        }]
    },

  ],
})

export default router
