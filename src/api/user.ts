import axios from "@/utils/axios.ts";
import type {PaginationParams, User} from "@/types/api.ts";

// 修改用户信息
export const updateUser = (id: number, userModel: Omit<User, 'id' | 'role_key' | 'description'>) => {
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