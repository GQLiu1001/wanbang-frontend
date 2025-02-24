// 用户登录
import axios from "@/utils/axios.ts";
import type {ChangePasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, User} from "@/types/api.ts"
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

