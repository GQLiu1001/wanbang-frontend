// api/aftersales.ts
import axios from "@/utils/axios.ts";
import type {Aftersale, AftersalePostRequest} from "@/types/interfaces.ts";

// 创建售后
export const createAftersale = (aftersaleModel: AftersalePostRequest) => {
    return axios.post('/aftersales', aftersaleModel);
};

// 获取订单的售后记录
export const getOrderAftersaleLogs = (orderId: number) => {
    return axios.get(`/aftersales/order/${orderId}`);
};

// 更新售后状态
export const updateAftersaleStatus = (aftersaleId: number, status: number) => {
    return axios.put(`/aftersales/${aftersaleId}/status`, { status });
};