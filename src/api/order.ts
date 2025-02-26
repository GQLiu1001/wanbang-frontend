// api/order.ts
import axios from "@/utils/axios.ts";
import type { Order, OrderQueryParams } from "@/types/api.ts";

// 创建订单
export const postOrder = (orderModel: Omit<Order, 'order_no' | 'order_create_time' | 'order_update_time' | 'adjusted_quantity' | 'adjusted_amount' | 'aftersale_type' | 'aftersale_status'>) => {
    return axios.post('/orders', orderModel);
};

// 查询订单列表
export const getOrders = (params: OrderQueryParams) => {
    return axios.get('/orders', { params });
};

// 修改订单
export const updateOrder = (orderNo: string, orderModel: Omit<Order, 'order_no' | 'order_create_time' | 'order_update_time' | 'adjusted_quantity' | 'adjusted_amount' | 'aftersale_type' | 'aftersale_status'>) => {
    return axios.put(`/orders/${orderNo}`, orderModel);
};

// 删除订单
export const deleteOrder = (orderNo: string) => {
    return axios.delete(`/orders/${orderNo}`);
};

// 获取订单总销售金额
export const fetchTotalSalesAmount = () => {
    return axios.get<{ total_amount: number }>('/sales/total-amount');
};

// 获取今日销售金额
export const fetchTodaySalesAmount = () => {
    return axios.get<{ today_amount: number }>('/sales/today-amount');
};

export const fetchSalesTrend = () => {
    // 根据当前日期（2025-02-26）计算最近五个月的范围
    const currentDate = new Date();
    const endMonth = new Date(currentDate);
    endMonth.setMonth(endMonth.getMonth() - 1); // 取上个月（2025-01）
    const startMonth = new Date(endMonth);
    startMonth.setMonth(startMonth.getMonth() - 4); // 回溯 4 个月（2024-09）

    const startMonthStr = startMonth.toISOString().slice(0, 7); // 格式化为 "YYYY-MM"
    const endMonthStr = endMonth.toISOString().slice(0, 7);

    return axios.get<{
        dates: string[];
        salesValues: number[];
        amounts: number[];
    }>('/sales/trend/', {
        params: {
            start_month: startMonthStr,
            end_month: endMonthStr,
        },
    });
};

// 新增：获取最火爆卖品数据
export const fetchTopProducts = () => {
    return axios.get<{ model_number: string; sales: number; total_amount: number }[]>('/sales/top-products');
};