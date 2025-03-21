import axios from '@/utils/axios';
import deliveryInstance from '@/utils/deliveryAxios';
import type { DriverQueryParams, DriverApprovalRequest } from '@/types/interfaces';

// 获取司机列表
export const getAllDrivers = (params: DriverQueryParams) => {
  return deliveryInstance.get('/delivery/drivers', { params });
};

// 获取司机详情
export const getDriverDetail = (driverId: number) => {
  return deliveryInstance.get(`/delivery/drivers/${driverId}`);
};

// 审核司机资格
export const approveDriver = (driverId: number, data: DriverApprovalRequest) => {
  return deliveryInstance.put(`/delivery/drivers/${driverId}/approval`, data);
};

// 拒绝司机资格
export const rejectDriver = (driverId: number, data: DriverApprovalRequest) => {
  return deliveryInstance.put(`/delivery/drivers/${driverId}/rejection`, data);
};

// 清零司机余额 (这个接口在文档中没有明确定义，保留原有实现)
export const resetDriverMoney = (driverId: number) => {
  return deliveryInstance.post(`/driver/${driverId}/reset-money`);
};