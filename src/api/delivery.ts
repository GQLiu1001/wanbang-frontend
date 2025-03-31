import axios from '@/utils/axios'; // 原系统的 axios 实例
import deliveryInstance from '@/utils/deliveryAxios'; // 新的配送系统 axios 实例
import type { DeliveryQueryParams, DispatchRequest, DriverQueryParams, DriverApprovalRequest } from '@/types/interfaces';

// 获取待派送订单列表 - 使用派送系统的 API
export const getPendingOrders = (params: DeliveryQueryParams) => {
  return deliveryInstance.get('/delivery/orders', { params });
};

// 派送订单 - 使用新的配送系统
export const dispatchOrder = (data: DispatchRequest) => {
  return deliveryInstance.post('/delivery/orders', data);
};

// 获取派送状态 - 使用新的配送系统
export const getDeliveryStatus = (orderId: number) => {
  return deliveryInstance.get(`/delivery/orders/${orderId}/status`);
};

// 更新派送状态
export const updateDeliveryStatusApi = (deliveryId: number, status: number, driverId?: number) => {
  return deliveryInstance.put(`/delivery/orders/${deliveryId}/status`, { status, driverId });
};

// 取消派送
export const cancelDelivery = (deliveryId: number, operatorId: number) => {
  return deliveryInstance.post(`/delivery/orders/${deliveryId}/cancel`, { operatorId });
};

// 获取司机列表
export const getDrivers = (params: DriverQueryParams) => {
  return deliveryInstance.get('/delivery/drivers', { params });
};

// 获取司机详情
export const getDriverDetail = (driverId: number) => {
  return deliveryInstance.get(`/delivery/drivers/${driverId}`);
};

// 审核司机资格
export const approveDriver = (driverId: number, approval: DriverApprovalRequest) => {
  return deliveryInstance.put(`/delivery/drivers/${driverId}/approval`, approval);
};

// 拒绝司机资格
export const rejectDriver = (driverId: number, approval: DriverApprovalRequest) => {
  return deliveryInstance.put(`/delivery/drivers/${driverId}/rejection`, approval);
};

// 删除司机
export const deleteDriver = (driverId: number, auditor: string) => {
  return deliveryInstance.delete(`/delivery/drivers/${driverId}/delete`, { data: { auditor } });
};
