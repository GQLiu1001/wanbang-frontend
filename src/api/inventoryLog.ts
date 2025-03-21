// inventoryLog.ts
import axios from '@/utils/axios';
import type { LogQueryParams, InventoryLogChangeRequest, TransferLogRequest, InboundLogRequest } from '@/types/interfaces';

// 查询记录
export const getInventoryLogs = (params: LogQueryParams) => {
    return axios.get('/logs', { params });
};

// 提交入库记录
export const postInboundLog = (logModel: InboundLogRequest) => {
    return axios.post('/logs/inbound', logModel);
};

// 提交调库记录
export const postTransferLog = (logModel: TransferLogRequest) => {
    return axios.post('/logs/transfer', logModel);
};

// 修改记录
export const updateInventoryLog = (logModel: InventoryLogChangeRequest, operationType: number) => {
    return axios.put('/logs', logModel, {
        params: {
            operation_type: operationType
        }
    });
};

// 删除记录（仅管理员）
export const deleteInventoryLog = (id: number) => {
    return axios.delete(`/logs/${id}`);
};