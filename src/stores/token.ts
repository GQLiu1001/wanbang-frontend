import { defineStore } from 'pinia';
import { ref } from 'vue';

// 定义 token 状态的类型
interface TokenState {
    token: string | null;
}

export const useTokenStore = defineStore('token', () => {
    // token 状态
    const token = ref<string | null>(localStorage.getItem('token') || null);

    // 设置 token 并持久化
    const setToken = (newToken: string) => {
        token.value = newToken;
        localStorage.setItem('token', newToken);
    };

    // 获取 token
    const getToken = () => {
        return token.value;
    };

    // 清除 token
    const clearToken = () => {
        token.value = null;
        localStorage.removeItem('token');
    };

    return {
        token,
        setToken,
        getToken,
        clearToken,
    };
});