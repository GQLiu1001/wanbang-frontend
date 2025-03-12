import axios from '@/utils/axios';
import type { DeliveryQueryParams, DispatchRequest } from '@/types/interfaces';

// 获取待派送订单列表
export const getPendingOrders = (params: DeliveryQueryParams) => {
  return axios.get('/orders', { params });
};

// 派送订单
export const dispatchOrder = (data: DispatchRequest) => {
  return axios.post('/delivery/dispatch', data);
};

// 获取派送状态
export const getDeliveryStatus = (orderId: number) => {
  return axios.get(`/delivery/status/${orderId}`);
};
