// 用户登录相关服务
import axios from "@/utils/axios.ts";
import type {ChangePasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, User} from "@/types/api.ts"

// 用户登录 - 注意这里的路径不要包含/api，因为baseURL已经包含了
export const loginService = (loginData: LoginRequest) => {
    return axios.post('/auth/login', loginData);
};

// 用户注册
export const registerService = (registerData: RegisterRequest) => {
    return axios.post('/auth/register', registerData);
};

// 重置密码（忘记密码）
export const resetPasswordService = (resetData: ResetPasswordRequest) => {
    return axios.post('/auth/reset-password', resetData);
};

// 登出函数也很简单，不需要手动设置 token
export const logout = () => {
    return axios.post('/auth/logout');
};