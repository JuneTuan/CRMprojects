export const storage = {
  get: (key: string) => {
    try {
      return uni.getStorageSync(key);
    } catch (e) {
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    try {
      uni.setStorageSync(key, value);
      return true;
    } catch (e) {
      return false;
    }
  },
  
  remove: (key: string) => {
    try {
      uni.removeStorageSync(key);
      return true;
    } catch (e) {
      return false;
    }
  },
  
  clear: () => {
    try {
      uni.clearStorageSync();
      return true;
    } catch (e) {
      return false;
    }
  }
};
