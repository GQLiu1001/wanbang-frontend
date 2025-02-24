import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import MockAdapter from 'axios-mock-adapter';

// Create Axios instance
const instance: AxiosInstance = axios.create({
    baseURL: 'http://localhost:80/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// Initialize Mock Adapter
const mock = new MockAdapter(instance, { delayResponse: 500 });

// Simulated user database (for demo purposes)
const mockUsers = [
    { username: 'admin', password: '123456', id: 1, phone: '13800138000', role_key: 'admin' },
    { username: 'user', password: 'password', id: 2, phone: '13900139000', role_key: 'user' },
];

// Mock login endpoint
mock.onPost('/auth/login').reply((config) => {
    try {
        const { username, password } = JSON.parse(config.data || '{}');

        // Validate input
        if (!username || !password) {
            return [
                400,
                {
                    code: 400,
                    message: '用户名或密码不能为空',
                    data: null,
                },
            ];
        }

        // Find user in mock database
        const user = mockUsers.find(
            (u) => u.username === username && u.password === password
        );

        if (user) {
            const token = `mock-satoken-${user.id}-${Date.now()}`; // Dynamic token
            return [
                200,
                {
                    code: 200,
                    message: '登录成功',
                    data: {
                        user: {
                            id: user.id,
                            username: user.username,
                            avatar: '',
                            phone: user.phone,
                            role_key: user.role_key,
                        },
                    },
                },
                { 'satoken': token }, // Return token in headers
            ];
        }

        return [
            401,
            {
                code: 401,
                message: '用户名或密码错误',
                data: null,
            },
        ];
    } catch (error) {
        return [
            500,
            {
                code: 500,
                message: '服务器内部错误',
                data: null,
            },
        ];
    }
});

// Mock logout endpoint (unchanged for now, but could be tied to mockUsers)
mock.onPost('/auth/logout').reply((config) => {
    const token = config.headers?.['satoken'];
    if (token && token.startsWith('mock-satoken-')) {
        return [
            200,
            {
                code: 200,
                message: '退出成功',
                data: null,
            },
        ];
    }
    return [
        401,
        {
            code: 401,
            message: 'token错误或未登录',
            data: null,
        },
    ];
});

// Request interceptor (unchanged)
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['satoken'] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor (unchanged)
instance.interceptors.response.use(
    (response: AxiosResponse) => {
        const { data, status } = response;
        if (status === 200) {
            switch (data.code) {
                case 200:
                    return response;
                case 400:
                    ElMessage.error(data.message || '请求参数错误');
                    return Promise.reject(new Error(data.message || '请求参数错误'));
                case 401:
                    ElMessage.error(data.message || '未登录，请重新登录');
                    localStorage.removeItem('token');
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
                    localStorage.removeItem('token');
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
            ElMessage.error('网络异常，请稍后重试');
        }
        return Promise.reject(error);
    }
);

export default instance;