export const state = {
  get token() {
    return localStorage.getItem("token");
  },

  set token(value: string | null) {
    if (value) {
      localStorage.setItem("token", value);
    } else {
      localStorage.removeItem("token");
    }
  },

  get userId() {
    return localStorage.getItem("userId");
  },

  set userId(value: string | null) {
    if (value) {
      localStorage.setItem("userId", value);
    } else {
      localStorage.removeItem("userId");
    }
  },

  get sendLanguage() {
    return localStorage.getItem("sendLanguage") || "en";
  },

  set sendLanguage(value: string) {
    localStorage.setItem("sendLanguage", value);
  },

  get receiveLanguage() {
    return localStorage.getItem("receiveLanguage") || "en";
  },

  set receiveLanguage(value: string) {
    localStorage.setItem("receiveLanguage", value);
  },

  get userApiKey() {
    return localStorage.getItem("userApiKey") || "";
  },

  set userApiKey(value: string) {
    if (value) {
      localStorage.setItem("userApiKey", value);
    } else {
      localStorage.removeItem("userApiKey");
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },
};
