import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ElMessage } from 'element-plus';
import router from '@/router';
import defaultAvatar from '@/assets/default_avatar.png';

// 创建 Axios 实例
const instance: AxiosInstance = axios.create({
    baseURL: 'http://localhost:80/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// 初始化 Mock 适配器，模拟后端响应
const mock = new MockAdapter(instance, { delayResponse: 500 });

// 模拟登录接口
mock.onPost('/auth/login').reply((config) => {
    const { username, password } = JSON.parse(config.data);
    if (username === 'admin' && password === '123456') {
        return [
            200, // HTTP 状态码
            {
                code: 200, // 业务状态码，对应 ResponseCode.SUCCESS
                message: '成功',
                data: {
                    user: {
                        id: 1,
                        username: 'admin',
                        avatar: defaultAvatar,
                        phone: '13800138000',
                        role_key: 'admin',
                    },
                },
            },
            { 'satoken': 'mock-satoken-123456' }, // 返回 token
        ];
    }
    return [
        401, // HTTP 状态码
        {
            code: 401, // 业务状态码，对应 ResponseCode.UNAUTHORIZED
            message: 'token错误或未登录',
            data: null,
        },
    ];
});

// 模拟退出登录接口
mock.onPost('/auth/logout').reply((config) => {
    const token = config.headers?.['satoken'];
    if (token && token === 'mock-satoken-123456') {
        return [
            200,
            {
                code: 200, // ResponseCode.SUCCESS
                message: '成功',
                data: null,
            },
        ];
    }
    return [
        401,
        {
            code: 401, // ResponseCode.UNAUTHORIZED
            message: 'token错误或未登录',
            data: null,
        },
    ];
});

// 请求拦截器：在每个请求中添加 satoken
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['satoken'] = token; // 使用 satoken 作为请求头
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器：处理后端返回的状态码
instance.interceptors.response.use(
    (response: AxiosResponse) => {
        const { data, status } = response;

        // HTTP 状态码为 200 时，检查业务状态码
        if (status === 200) {
            switch (data.code) {
                case 200: // ResponseCode.SUCCESS
                    return response; // 成功直接返回
                case 400: // ResponseCode.BAD_REQUEST
                    ElMessage.error(data.message || '请求参数错误');
                    return Promise.reject(new Error(data.message || '请求参数错误'));
                case 401: // ResponseCode.UNAUTHORIZED
                    ElMessage.error(data.message || '未登录，请重新登录');
                    localStorage.removeItem('token');
                    router.push('/login');
                    return Promise.reject(new Error(data.message || '未授权'));
                case 403: // ResponseCode.FORBIDDEN
                    ElMessage.error(data.message || '未授权，权限不足');
                    return Promise.reject(new Error(data.message || '无权限'));
                case 404: // ResponseCode.NOT_FOUND
                    ElMessage.error(data.message || '资源未找到');
                    return Promise.reject(new Error(data.message || '资源未找到'));
                case 500: // ResponseCode.INTERNAL_SERVER_ERROR
                    ElMessage.error(data.message || '服务器内部错误');
                    return Promise.reject(new Error(data.message || '服务器错误'));
                default:
                    ElMessage.error(data.message || '未知错误');
                    return Promise.reject(new Error(data.message || '未知错误'));
            }
        }
        return response; // 其他 HTTP 状态码直接返回
    },
    (error) => {
        const { response } = error;
        if (response) {
            // 根据 HTTP 状态码处理错误
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