import axios from "@/utils/axios.ts";
import type {InventoryLog, LogQueryParams} from "@/types/api.ts";

// 查询入库记录
export const getInventoryLogs = (params: LogQueryParams) => {
    return axios.get('/api/inventory/logs', { params });
};

// 修改入库/出库/调库记录
export const updateInventoryLog = (id: number, logModel: Omit<InventoryLog, 'id' | 'create_time' | 'update_time'>) => {
    return axios.put(`/api/inventory/logs/${id}`, logModel);
};

// 删除入库/出库/调库记录
export const deleteInventoryLog = (id: number) => {
    return axios.delete(`/api/inventory/logs/${id}`);
};

// 创建调库记录
export const postInventoryLog = (logModel: Omit<InventoryLog, 'id' | 'create_time' | 'update_time'>) => {
    return axios.post('/api/inventory/logs', logModel);
};