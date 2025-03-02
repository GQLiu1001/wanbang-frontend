import axios from "@/utils/axios.ts";
import type {InventoryItem, InventoryQueryParams} from "@/types/interfaces.ts";

// 查询库存列表
export const getInventoryItems = (params: InventoryQueryParams) => {
    return axios.get('/inventory/items', { params });
};

// 修改库存
export const updateInventoryItem = (id: number, inventoryModel: InventoryItem) => {
    return axios.put(`/inventory/items/${id}`, inventoryModel);
};

// 删除库存
export const deleteInventoryItem = (id: number) => {
    return axios.delete(`/inventory/items/${id}`);
};

// 提交入库
export const postInventoryItem = (inventoryModel: Omit<InventoryItem, 'id' | 'create_time' | 'update_time'> & { box_count: number }) => {
    return axios.post('/inventory/items', inventoryModel);
};