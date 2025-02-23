// api/order.ts
import axios from "@/utils/axios.ts";
import type { Order, OrderQueryParams } from "@/types/api.ts";

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

// 获取订单总销售金额
export const fetchTotalSalesAmount = () => {
    return axios.get<{ total_amount: number }>('/api/sales/total-amount');
};

// 获取今日销售金额
export const fetchTodaySalesAmount = () => {
    return axios.get<{ today_amount: number }>('/api/sales/today-amount');
};

// 新增：获取销售趋势数据
export const fetchSalesTrend = () => {
    return axios.get<{ dates: string[]; values: number[] }>('/api/sales/trend');
};

// 新增：获取最火爆卖品数据
export const fetchTopProducts = () => {
    return axios.get<{ model_number: string; sales: number; total_amount: number }[]>('/api/sales/top-products');
};