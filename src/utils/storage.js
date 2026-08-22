export const storage = {
  get(key) {
    return sessionStorage.getItem(key);
  },

  set(key, value) {
    sessionStorage.setItem(key, value);
  },

  remove(key) {
    sessionStorage.removeItem(key);
  }
};
