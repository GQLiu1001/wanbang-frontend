// axios.ts
import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';

// 创建Axios实例
const instance = axios.create({
    baseURL: '/api', // 使用相对路径，让Vite代理生效
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});


// Axios 请求拦截器
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 从 localStorage 获取存储的 satoken
        const saToken = localStorage.getItem('satoken');
        console.log('从 localStorage 读取到 satoken:', saToken)
        // 如果存在 satoken，则添加到请求头
        if (saToken) {
            config.headers.satoken = saToken;
        }
        console.log('发送请求:', config)
        // 记录请求信息用于调试
        console.log('发送请求:', {
            url: config.url,
            method: config.method,
            headers: config.headers
        });

        return config;
    },
    (error) => Promise.reject(error)
);



// 响应拦截器
instance.interceptors.response.use(
    (response: AxiosResponse) => {
        const { data, status } = response;
        // 保存可能的token
        const token = response.headers['satoken'];
        if (token) {
            localStorage.setItem('satoken', token);
        }

        if (status === 200) {
            switch (data.code) {
                case 200:
                    return response;
                case 400:
                    ElMessage.error(data.message || '请求参数错误');
                    return Promise.reject(new Error(data.message || '请求参数错误'));
                case 401:
                    ElMessage.error(data.message || '未登录，请重新登录');
                    localStorage.removeItem('satoken');
                    router.push('/login');
                    return Promise.reject(new Error(data.message || '未授权'));
                case 403:
                    ElMessage.error(data.message || '未授权，权限不足');
                    return Promise.reject(new Error(data.message || '无权限'));
                case 404:
                    ElMessage.error(data.message || '资源未找到');
                    return Promise.reject(new Error(data.message || '资源未找到'));
                case 500:
                    ElMessage.error(data.message || '服务器内部错误');
                    return Promise.reject(new Error(data.message || '服务器错误'));
                default:
                    ElMessage.error(data.message || '未知错误');
                    return Promise.reject(new Error(data.message || '未知错误'));
            }
        }
        return response;
    },
    (error) => {
        const { response } = error;
        if (response) {
            switch (response.status) {
                case 400:
                    ElMessage.error('请求参数错误');
                    break;
                case 401:
                    ElMessage.error('未登录，请重新登录');
                    localStorage.removeItem('satoken');
                    router.push('/login');
                    break;
                case 403:
                    ElMessage.error('未授权，权限不足');
                    break;
                case 404:
                    ElMessage.error('资源未找到');
                    break;
                case 500:
                    ElMessage.error('服务器内部错误');
                    break;
                default:
                    ElMessage.error(`错误: ${response.status}`);
            }
        } else {
            ElMessage.error('网络异常，请检查后端服务是否启动');
        }
        return Promise.reject(error);
    }
);

export default instance;