// 创建专门用于配送系统的axios实例
import axios, { type AxiosInstance } from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';

const deliveryInstance: AxiosInstance = axios.create({
    baseURL: 'http://另外的后端系统地址', // 配送系统的基础URL
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// 请求拦截器
deliveryInstance.interceptors.request.use(
    (config) => {
        // 可以设置专门的认证token
        const deliveryToken = localStorage.getItem('deliveryToken');
        if (deliveryToken) {
            config.headers.Authorization = `Bearer ${deliveryToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器
deliveryInstance.interceptors.response.use(
    (response) => {
        // 根据配送系统的响应格式调整处理逻辑
        if (response.data?.success) {
            return response;
        }
        return Promise.reject(new Error(response.data?.message || '配送系统请求失败'));
    },
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    ElMessage.error('配送系统未授权，请重新登录');
                    break;
                case 404:
                    ElMessage.error('配送系统接口不存在');
                    break;
                default:
                    ElMessage.error(error.response.data?.message || '配送系统请求失败');
            }
        } else {
            ElMessage.error('配送系统网络错误');
        }
        return Promise.reject(error);
    }
);

export default deliveryInstance; 