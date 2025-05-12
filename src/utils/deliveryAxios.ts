// 创建专门用于配送系统的axios实例
import axios from 'axios';
import { useUserStore } from '../stores/user';

// 根据环境获取基础URL
const baseURL = import.meta.env.VITE_DELIVERY_API_BASE_URL || '/delivery-api';

// 创建专门用于配送系统的axios实例
const deliveryInstance = axios.create({
    baseURL, // 使用环境变量或默认值
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// 请求拦截器
deliveryInstance.interceptors.request.use(
    config => {
        const userStore = useUserStore();
        // 尝试从localStorage中直接获取token
        let token = userStore.getToken();
        // 如果没有找到token，尝试从satoken中获取
        if (!token) {
            const satokenValue = localStorage.getItem('satoken');
            if (satokenValue) {
                token = satokenValue;
                console.log('从satoken获取的token:', token);
            }
        }
        
        console.log('配送系统请求使用的token:', token);
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            console.warn('配送系统请求缺少Authorization token');
        }
        
        console.log('配送系统请求配置:', {
            url: config.url,
            method: config.method,
            headers: config.headers
        });
        
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
deliveryInstance.interceptors.response.use(
    response => {
        // 检查响应中的业务状态码
        if (response.data && response.data.code !== undefined && response.data.code !== 200) {
            console.warn('配送系统API响应业务状态码非200:', {
                url: response.config.url,
                status: response.status,
                businessCode: response.data.code,
                message: response.data.message,
                data: response.data.data
            });
        }
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