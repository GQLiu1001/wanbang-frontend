import {defineStore} from "pinia";
import {ref} from "vue";

interface UserInfo {
    id?: number;
    username: string;
    avatar: string;
    phone: string;
    role_key?: string; // 新增 role_key
}

export const useUserStore = defineStore('user', () => {
    const userInfo = ref<UserInfo | null>(
        JSON.parse(localStorage.getItem('userInfo') || 'null') || null
    );

    const setUserInfo = (info: UserInfo) => {
        userInfo.value = info;
        localStorage.setItem('userInfo', JSON.stringify(info));
    };

    const getUserInfo = () => {
        return userInfo.value;
    };

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