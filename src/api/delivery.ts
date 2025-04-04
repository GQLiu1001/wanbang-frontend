import axios from '@/utils/axios'; // 原系统的 axios 实例
import deliveryInstance from '@/utils/deliveryAxios'; // 新的配送系统 axios 实例
import type { DeliveryQueryParams, DispatchRequest, DriverQueryParams, DriverApprovalRequest } from '@/types/interfaces';

// 获取待派送订单列表 - 使用派送系统的 API
export const getPendingOrders = (params: DeliveryQueryParams) => {
  return deliveryInstance.get('/api/delivery/order', { params });
};

// 派送订单 - 使用新的配送系统
export const dispatchOrder = (data: DispatchRequest) => {
  return deliveryInstance.post('/api/delivery/order', data);
};

// 获取派送状态 - 使用新的配送系统
export const getDeliveryStatus = (orderId: number) => {
  return deliveryInstance.get(`/api/delivery/order/${orderId}/status`);
};

// 更新派送状态
export const updateDeliveryStatusApi = (deliveryId: number, status: number, driverId?: number) => {
  return deliveryInstance.put(`/api/delivery/order/${deliveryId}/status`, { status, driverId });
};

// 取消派送
export const cancelDelivery = (deliveryId: number, operatorId: number) => {
  return deliveryInstance.post(`/api/delivery/order/${deliveryId}/status`, { operatorId });
};

// 获取司机列表
export const getDrivers = (params: DriverQueryParams) => {
  return deliveryInstance.get('/api/delivery/driver', { params });
};

// // 获取司机详情
// export const getDriverDetail = (driverId: number) => {
//   return deliveryInstance.get(`/api/delivery/driver/${driverId}`);
// };

// 审核司机资格
export const approveDriver = (driverId: number, approval: DriverApprovalRequest) => {
  return deliveryInstance.put(`/api/delivery/driver/${driverId}/approval`, null, { params: approval });
};

// 拒绝司机资格
export const rejectDriver = (driverId: number, approval: DriverApprovalRequest) => {
  return deliveryInstance.put(`/api/delivery/driver/${driverId}/rejection`, null, { params: approval });
};

// 删除司机
export const deleteDriver = (driverId: number, auditor: string) => {
  return deliveryInstance.delete(`/api/delivery/driver/${driverId}/delete`, { data: { auditor } });
};

// 清零司机余额
export const resetDriverMoney = (driverId: number, auditor: string) => {
  return deliveryInstance.delete(`/api/delivery/driver/${driverId}/reset-money`, { params: { auditor } });
};
