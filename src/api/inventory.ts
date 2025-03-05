import axios from "@/utils/axios.ts";
import type {InventoryItem, InventoryQueryParams} from "@/types/interfaces.ts";

// inventory.ts
// 查询库存列表
export const getInventoryItems = (params: InventoryQueryParams) => {
    return axios.get('/inventory/items', { params });
};

// 修改库存物品
export const updateInventoryItem = (id: number, inventoryModel: InventoryItem) => {
    return axios.put(`/inventory/items/${id}`, inventoryModel);
};

// 删除库存物品（仅管理员）
export const deleteInventoryItem = (id: number) => {
    return axios.delete(`/inventory/items/${id}`);
};

// 根据产品型号查询库存信息
export const getInventoryByModelNumber = (modelNumber: string) => {
    return axios.get(`/inventory/items/model/${modelNumber}`);
};