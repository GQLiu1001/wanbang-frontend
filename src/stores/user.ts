import { defineStore } from 'pinia';
import { ref } from 'vue';

// 定义用户信息的类型（基于 sys_user 表）
interface UserInfo {
    id?: number; // 添加 id 字段，可选（后端可能不一定返回）
    username: string;
    avatar: string;
    phone: string;
}

export const useUserStore = defineStore('user', () => {
    // 用户信息状态，默认从 localStorage 加载
    const userInfo = ref<UserInfo | null>(
        JSON.parse(localStorage.getItem('userInfo') || 'null') || null
    );

    // 设置用户信息并持久化
    const setUserInfo = (info: UserInfo) => {
        userInfo.value = info;
        localStorage.setItem('userInfo', JSON.stringify(info));
    };

    // 获取用户信息
    const getUserInfo = () => {
        return userInfo.value;
    };

    // 清除用户信息（用于退出登录）
    const clearUserInfo = () => {
        userInfo.value = null;
        localStorage.removeItem('userInfo');
    };

    return {
        userInfo,
        setUserInfo,
        getUserInfo,
        clearUserInfo,
    };
});