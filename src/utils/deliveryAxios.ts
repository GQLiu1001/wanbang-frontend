// 创建专门用于配送系统的axios实例
import axios from 'axios';
import { useUserStore } from '../stores/user';

// 创建专门用于配送系统的axios实例
const deliveryInstance = axios.create({
    baseURL: '/delivery-api', // 配送系统API地址
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// 请求拦截器
deliveryInstance.interceptors.request.use(
    config => {
        const userStore = useUserStore();
        const token = userStore.getToken();
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
deliveryInstance.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response) {
            // 根据响应状态码处理错误
            switch (error.response.status) {
                case 401:
                    // 未授权，清除token并重定向到登录页
                    const userStore = useUserStore();
                    userStore.logout();
                    window.location.href = '/login';
                    break;
                case 403:
                    console.error('无权限访问');
                    break;
                case 404:
                    console.error('请求的资源不存在');
                    break;
                case 500:
                    console.error('服务器内部错误');
                    break;
                default:
                    console.error(`未知错误: ${error.response.status}`);
            }
        } else if (error.request) {
            // 请求发出但没有收到响应
            console.error('网络错误，无法连接到服务器');
        } else {
            // 请求设置时出现错误
            console.error('请求错误', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default deliveryInstance; 