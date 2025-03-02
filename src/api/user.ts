// user.ts
import axios from "@/utils/axios.ts";
import type { User, PaginationParams } from "@/types/interfaces.ts";

// 定义 UpdateUserRequest 类型，包含 oldPassword
interface UpdateUserRequest extends Omit<User, 'id' | 'role_id' | 'description'> {
    oldPassword?: string;
}

// 修改用户信息
export const updateUser = (id: number, userModel: UpdateUserRequest) => {
    return axios.put(`/users/${id}`, userModel);
};

// 查询所有用户
export const getUsers = (params: PaginationParams) => {
    return axios.get('/users', { params });
};

// 删除用户
export const deleteUser = (id: number) => {
    return axios.delete(`/users/${id}`);
};

// 新增上传文件函数（直接上传文件，返回 fileUrl）
// 修改后的上传文件函数
export const uploadFile = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);  // 确保参数名为'file'，与后端一致

    // 这些参数目前后端并不需要，可以考虑移除
    // formData.append('fileName', file.name);
    // formData.append('fileType', file.type);

    return axios.post<{ fileUrl: string }>('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

