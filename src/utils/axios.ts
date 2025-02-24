import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ElMessage } from 'element-plus';
import router from '@/router';
import defaultAvatar from '@/assets/default_avatar.png';

const instance: AxiosInstance = axios.create({
    baseURL: 'http://localhost:80/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

const mock = new MockAdapter(instance, { delayResponse: 500 });

mock.onPost('/auth/login').reply((config) => {
    const { username, password } = JSON.parse(config.data);
    if (username === 'admin' && password === '123456') {
        return [
            200,
            {
                code: 200,
                message: '登录成功',
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
            { 'satoken': 'mock-satoken-123456' },
        ];
    }
    return [401, { code: 401, message: '用户名或密码错误', data: null }];
});

mock.onPost('/auth/logout').reply((config) => {
    const token = config.headers?.['satoken'];
    if (token && token === 'mock-satoken-123456') {
        return [200, { code: 200, message: '退出登录成功', data: null }];
    }
    return [401, { code: 401, message: '未登录或 Token 无效', data: null }];
});

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

instance.interceptors.response.use(
    (response: AxiosResponse) => {
        const { data, status } = response;
        if (status === 200 || status === 201) {
            if (data.code === 200 || data.code === 201) {
                return response;
            } else {
                ElMessage.error(data.message || '请求失败');
                return Promise.reject(new Error(data.message || '请求失败'));
            }
        }
        return response;
    },
    (error) => {
        const { response } = error;
        if (response) {
            switch (response.status) {
                case 401:
                    ElMessage.error('未授权，请重新登录');
                    localStorage.removeItem('token');
                    router.push('/login');
                    break;
                case 403:
                    ElMessage.error('无权限访问');
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