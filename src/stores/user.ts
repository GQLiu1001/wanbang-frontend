import { defineStore } from "pinia";
import { ref } from "vue";

interface UserInfo {
    id?: number;
    username: string;
    avatar: string;
    phone?: string;
    role_key?: string;
}

export const useUserStore = defineStore('user', () => {
    // 改进初始化逻辑，增加错误处理
    const userInfo = ref<UserInfo | null>(null);

    try {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            userInfo.value = JSON.parse(storedUserInfo);
            console.log('从 localStorage 读取到用户信息:', userInfo.value);
        }
    } catch (error) {
        console.error('解析 localStorage 中的用户信息失败:', error);
        localStorage.removeItem('userInfo'); // 删除无效数据
    }

    const setUserInfo = (info: UserInfo) => {
        console.log('设置用户信息:', info);
        userInfo.value = info;
        localStorage.setItem('userInfo', JSON.stringify(info));
    };

    const getUserInfo = () => {
        // 如果内存中没有，再次尝试从 localStorage 获取
        if (!userInfo.value) {
            try {
                const storedUserInfo = localStorage.getItem('userInfo');
                if (storedUserInfo) {
                    userInfo.value = JSON.parse(storedUserInfo);
                    console.log('二次从 localStorage 读取用户信息:', userInfo.value);
                }
            } catch (error) {
                console.error('二次获取用户信息失败:', error);
            }
        }
        return userInfo.value;
    };

    const clearUserInfo = () => {
        userInfo.value = null;
        localStorage.removeItem('userInfo');
        console.log('已清除用户信息');
    };

    // 新增：判断用户是否是管理员的便捷方法
    const isAdmin = () => {
        return userInfo.value?.role_key === 'admin';
    };

    // 新增：获取token的方法
    const getToken = () => {
        return localStorage.getItem('token') || '';
    };

    // 新增：设置token的方法
    const setToken = (token: string) => {
        localStorage.setItem('token', token);
    };

    // 新增：登出方法，清除用户信息和token
    const logout = () => {
        clearUserInfo();
        localStorage.removeItem('token');
    };

    return {
        userInfo,
        setUserInfo,
        getUserInfo,
        clearUserInfo,
        isAdmin,
        getToken,
        setToken,
        logout,
    };
});