import axios, {
    type AxiosInstance,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ElMessage } from 'element-plus';
import router from '@/router';
import defaultAvatar from '@/assets/default_avatar.png'
// 创建 Axios 实例
const instance: AxiosInstance = axios.create({
    baseURL: 'http://api.example.com', // 可以保留，但不会实际请求
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 创建 Mock 实例
const mock = new MockAdapter(instance, { delayResponse: 500 }); // 模拟 500ms 延迟

// Mock 登录接口
mock.onPost('/auth/login').reply((config) => {
    const { username, password } = JSON.parse(config.data);
    if (username === 'admin' && password === '123456') {
        return [
            200,
            {
                code: 0,
                message: '登录成功',
                data: {
                    token: 'mock-token-123456',
                    user: {
                        id: 1,
                        username: 'admin',
                        avatar: defaultAvatar,
                        phone: '13800138000',
                    },
                },
            },
        ];
    }
    return [401, { code: 1, message: '用户名或密码错误' }];
});

// Mock 注册接口
mock.onPost('/auth/register').reply((config) => {
    const { username } = JSON.parse(config.data);
    if (username === 'admin') {
        return [400, { code: 1, message: '用户名已存在' }];
    }
    return [201, { code: 0, message: '注册成功', data: null }];
});

// Mock 重置密码接口
mock.onPost('/auth/reset-password').reply((config) => {
    const { username, phone } = JSON.parse(config.data);
    if (username === 'admin' && phone === '13800138000') {
        return [200, { code: 0, message: '密码重置成功', data: null }];
    }
    return [400, { code: 1, message: '用户名或手机号不匹配' }];
});

// Mock 修改用户信息接口
mock.onPut(/\/api\/users\/\d+/).reply((config) => {
    const data = JSON.parse(config.data);
    return [
        200,
        {
            code: 0,
            message: '修改成功',
            data: null,
        },
    ];
});

// 请求拦截器
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('请求拦截器错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    (response: AxiosResponse) => {
        const { data, status } = response;
        if (status === 200 || status === 201) {
            if (data.code === 0) {
                return data.data; // 返回实际数据
            } else {
                ElMessage.error(data.message || '请求失败');
                return Promise.reject(new Error(data.message || '请求失败'));
            }
        }
        return response;
    },
    (error) => {
        const { response, message } = error;
        if (response) {
            switch (response.status) {
                case 400:
                    ElMessage.error('请求参数错误');
                    break;
                case 401:
                    ElMessage.error('未授权，请重新登录');
                    router.push('/login');
                    break;
                case 403:
                    ElMessage.error('无权限访问');
                    break;
                case 404:
                    ElMessage.error('请求资源不存在');
                    break;
                case 500:
                    ElMessage.error('服务器错误');
                    break;
                default:
                    ElMessage.error(`未知错误: ${response.status}`);
            }
        } else if (message.includes('timeout')) {
            ElMessage.error('请求超时，请检查网络');
        } else {
            ElMessage.error('网络异常，请稍后重试');
        }
        console.error('响应拦截器错误:', error);
        return Promise.reject(error);
    }
);

export default instance;