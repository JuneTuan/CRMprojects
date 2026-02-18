import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>('');
  const userInfo = ref<any>(null);
  const isLoggedIn = ref<boolean>(false);

  const setToken = (newToken: string) => {
    token.value = newToken;
    uni.setStorageSync('token', newToken);
  };

  const setUserInfo = (info: any) => {
    userInfo.value = info;
    uni.setStorageSync('userInfo', info);
  };

  const login = (authToken: string, info: any) => {
    setToken(authToken);
    setUserInfo(info);
    isLoggedIn.value = true;
  };

  const logout = () => {
    token.value = '';
    userInfo.value = null;
    isLoggedIn.value = false;
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
  };

  const initAuth = () => {
    const savedToken = uni.getStorageSync('token');
    const savedUserInfo = uni.getStorageSync('userInfo');
    if (savedToken && savedUserInfo) {
      token.value = savedToken;
      userInfo.value = savedUserInfo;
      isLoggedIn.value = true;
    }
  };

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
    setToken,
    setUserInfo,
    initAuth
  };
});
