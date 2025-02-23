// user.ts
import axios from "@/utils/axios.ts";
import type { User, PaginationParams } from "@/types/api.ts";

// 定义 UpdateUserRequest 类型，包含 oldPassword
interface UpdateUserRequest extends Omit<User, 'id' | 'role_key' | 'description'> {
    oldPassword?: string;
}

// 修改用户信息
export const updateUser = (id: number, userModel: UpdateUserRequest) => {
    return axios.put(`/api/users/${id}`, userModel);
};

// 查询所有用户
export const getUsers = (params: PaginationParams) => {
    return axios.get('/api/users', { params });
};

// 删除用户
export const deleteUser = (id: number) => {
    return axios.delete(`/api/users/${id}`);
};

// 新增获取上传 URL 的函数
export const getUploadUrl = (uploadData: { fileName: string; fileType: string }) => {
    return axios.post<{ uploadUrl: string; fileUrl: string }>('/api/upload', uploadData);
};