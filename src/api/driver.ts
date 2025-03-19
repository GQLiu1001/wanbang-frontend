import axios from '@/utils/axios';
import deliveryInstance from '@/utils/deliveryAxios';
import type { DriverQueryParams, DriverApprovalRequest } from '@/types/interfaces';

// 获取待审核司机列表
export const getPendingDrivers = (params: DriverQueryParams) => {
  return deliveryInstance.get('/driver/pending', { params });
};

// 获取所有司机列表
export const getAllDrivers = (params: DriverQueryParams) => {
  return deliveryInstance.get('/driver/list', { params });
};

// 审核通过司机
export const approveDriver = (driverId: number, data: DriverApprovalRequest) => {
  return deliveryInstance.post(`/driver/approve/${driverId}`, data);
};

// 删除/拒绝司机
export const rejectDriver = (driverId: number) => {
  return deliveryInstance.delete(`/driver/${driverId}`);
}; 