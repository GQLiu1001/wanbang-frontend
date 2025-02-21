import axios, {
    type AxiosInstance,
    type AxiosResponse,
    type InternalAxiosRequestConfig
} from 'axios';
import { ElMessage } from 'element-plus';
import router from "@/router"; // 假设使用 Element Plus 的消息提示

// 创建 Axios 实例
const instance: AxiosInstance = axios.create({
    baseURL: 'http://api.example.com', // 你的 API 基础地址
    timeout: 10000, // 请求超时时间（毫秒）
    headers: {
        'Content-Type': 'application/json', // 默认请求头
    },
});

// 请求拦截器
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 在发送请求之前做些什么
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config; // 返回 InternalAxiosRequestConfig 类型
    },
    (error) => {
        // 请求错误处理
        console.error('请求拦截器错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    (response: AxiosResponse) => {
        // 对响应数据做些什么
        const { data, status } = response;

        // 1. 检查状态码（自定义逻辑）
        if (status === 200) {
            // 假设后端返回格式为 { code: number, data: any, message: string }
            if (data.code === 0) {
                return data.data; // 返回实际数据
            } else {
                ElMessage.error(data.message || '请求失败');
                return Promise.reject(new Error(data.message || '请求失败'));
            }
        }

        return response; // 如果不处理，直接返回原始响应
    },
    (error) => {
        // 对响应错误做些什么
        const { response, message } = error;

        // 1. 根据状态码处理常见错误
        if (response) {
            switch (response.status) {
                case 400:
                    ElMessage.error('请求参数错误');
                    break;
                case 401:
                    ElMessage.error('未授权，请重新登录');
                    // 可以跳转到登录页
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

// 导出封装好的实例
export default instance;