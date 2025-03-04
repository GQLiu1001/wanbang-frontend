
import axios from "@/utils/axios.ts";
// sales.ts
// 获取最火爆卖品数据
export const fetchTopProducts = () => {
    return axios.get('/sales/top-products');
};

// 获取销售趋势数据
export const fetchSalesTrend = (year: number, month: number, length: number) => {
    return axios.get(`/sales/trend/${year}/${month}/${length}`);
};

// 获取今日销售金额
export const fetchTodaySalesAmount = () => {
    return axios.get('/sales/today-amount');
};

// 获取订单总销售金额
export const fetchTotalSalesAmount = () => {
    return axios.get('/sales/total-amount');
};