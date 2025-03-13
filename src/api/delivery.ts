import axios from '@/utils/axios'; // 原系统的 axios 实例
import deliveryInstance from '@/utils/deliveryAxios'; // 新的配送系统 axios 实例
import type { DeliveryQueryParams, DispatchRequest } from '@/types/interfaces';

// 获取待派送订单列表 - 使用原系统的 API
export const getPendingOrders = (params: DeliveryQueryParams) => {
  return axios.get('/orders', { params });
};

// 派送订单 - 使用新的配送系统
export const dispatchOrder = (data: DispatchRequest) => {
  return deliveryInstance.post('/delivery/dispatch', data);
};

// 获取派送状态 - 使用新的配送系统
export const getDeliveryStatus = (orderId: number) => {
  return deliveryInstance.get(`/delivery/status/${orderId}`);
};
