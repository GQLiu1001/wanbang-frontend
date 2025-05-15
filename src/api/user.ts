import axios from "@/utils/axios";
import type {User, PaginationParams, UpdateUserRequest} from "@/types/interfaces";

// user.ts
// 修改用户信息
export const updateUser = (id: number, userModel: UpdateUserRequest) => {
    return axios.put(`/users/${id}`, userModel);
};

// 查询所有用户
export const getUsers = (params: PaginationParams) => {
    return axios.get('/users', { params });
};

// 删除用户（仅管理员）
export const deleteUser = (id: number) => {
    return axios.delete(`/users/${id}`);
};

// 上传用户头像
export const uploadAvatar = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

