import axios from "@/utils/axios.ts";
import type { Order, OrderQueryParams } from "@/types/api.ts"; // 使用 import type 导入类型

// 创建订单
export const postOrder = (orderModel: Omit<Order, 'order_no' | 'order_create_time' | 'order_update_time' | 'adjusted_quantity' | 'adjusted_amount' | 'aftersale_type' | 'aftersale_status'>) => {
    return axios.post('/api/orders', orderModel);
};

// 查询订单列表
export const getOrders = (params: OrderQueryParams) => {
    return axios.get('/api/orders', { params });
};

// 修改订单
export const updateOrder = (orderNo: string, orderModel: Omit<Order, 'order_no' | 'order_create_time' | 'order_update_time' | 'adjusted_quantity' | 'adjusted_amount' | 'aftersale_type' | 'aftersale_status'>) => {
    return axios.put(`/api/orders/${orderNo}`, orderModel);
};

// 删除订单
export const deleteOrder = (orderNo: string) => {
    return axios.delete(`/api/orders/${orderNo}`);
};