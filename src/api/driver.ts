import axios from '@/utils/axios';
import deliveryInstance from '@/utils/deliveryAxios';
import type { DriverQueryParams, DriverApprovalRequest } from '@/types/interfaces';

// 获取司机列表
export const getAllDrivers = (params: DriverQueryParams) => {
  return deliveryInstance.get('/api/delivery/driver', { params });
};

// 获取司机详情
export const getDriverDetail = (driverId: number) => {
  return deliveryInstance.get(`/api/delivery/driver/${driverId}`);
};

// 审核司机资格
export const approveDriver = (driverId: number, data: DriverApprovalRequest) => {
  return deliveryInstance.put(`/api/delivery/driver/${driverId}/approval`, null, { params: data });
};

// 拒绝司机资格
export const rejectDriver = (driverId: number, data: DriverApprovalRequest) => {
  return deliveryInstance.put(`/api/delivery/driver/${driverId}/rejection`, null, { params: data });
};

// 删除司机
export const deleteDriver = (driverId: number, auditor: string) => {
  return deliveryInstance.delete(`/api/delivery/driver/${driverId}/delete`, { data: { auditor } });
};

// 清零司机余额 - 尝试两种参数传递方式
export const resetDriverMoney = (driverId: number, auditor: string) => {
  // 先尝试通过URL params传递，如果后端期望这种方式
  return deliveryInstance.delete(`/api/delivery/driver/${driverId}/reset-money?auditor=${encodeURIComponent(auditor)}`);
  
  // 如果上面方式不工作，则可以尝试使用以下两种方法之一：
  // 方法1: data参数
  // return deliveryInstance.delete(`/api/delivery/driver/${driverId}/reset-money`, { data: { auditor } });
  
  // 方法2: params参数 
  // return deliveryInstance.delete(`/api/delivery/driver/${driverId}/reset-money`, { params: { auditor } });
};