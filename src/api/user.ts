// user.ts
import axios from "@/utils/axios.ts";
import type { User, PaginationParams } from "@/types/api.ts";

// 定义 UpdateUserRequest 类型，包含 oldPassword
interface UpdateUserRequest extends Omit<User, 'id' | 'role_id' | 'description'> {
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

// 新增上传文件函数（直接上传文件，返回 fileUrl）
export const uploadFile = (file: File) => {
    const formData = new FormData();
    formData.append('file', file); // 上传文件
    formData.append('fileName', file.name); // 可选，文件名
    formData.append('fileType', file.type); // 可选，文件类型
    return axios.post<{ fileUrl: string }>('/api/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};