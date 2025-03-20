// api/order.ts
import axios from "@/utils/axios.ts";
import type {
    Order,
    OrderChangeRequest,
    OrderItemChangeRequest,
    OrderPostRequest,
    OrderQueryParams
} from "@/types/interfaces.ts";

// order.ts
// 创建新订单
export const postOrder = (orderModel: OrderPostRequest) => {
    return axios.post('/orders', orderModel);
};

// 查询订单列表
export const getOrders = (params: OrderQueryParams) => {
    return axios.get('/orders', { params });
};

// 查询订单详情
export const getOrderDetail = (id: number) => {
    return axios.get(`/orders/${id}`);
};

// 修改订单信息
export const updateOrder = (id: number, orderModel: OrderChangeRequest) => {
    return axios.put(`/orders/${id}`, orderModel);
};

//修改8080配送状态
export const updateDispatchStatus = (id: number) => {
    return axios.put(`/orders/${id}/dispatch_status`);
};

// 订单项变更
export const updateOrderItem = (itemId: number, itemModel: OrderItemChangeRequest) => {
    return axios.put(`/orders/items/${itemId}`, itemModel);
};

// 添加订单项
export const addOrderItem = (orderId: number, itemModel: any) => {
    return axios.post(`/orders/${orderId}/items`, itemModel);
};

// 删除订单项
export const deleteOrderItem = (itemId: number) => {
    return axios.delete(`/orders/items/${itemId}`);
};

// 删除订单
export const deleteOrder = (orderId: number) => {
    return axios.delete(`/orders/${orderId}`);
};
