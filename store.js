import { create } from "zustand";
import ApiKit from "./common/ApiKit";
import HttpKit from "./common/HttpKit";
import { AUTH_TOKEN_KEY } from "./lib/keyChain";

let location;
if (typeof window !== "undefined") {
  location = window.location;
}

const useStore = create((set) => ({
  user: null,
  userLoading: false,

  fetchUser: async () => {
    try {
      set({ userLoading: true });
      const { data } = await ApiKit.user.getMe();
      set({ user: data?.user });
      set({ userLoading: false });
    } catch (error) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      HttpKit.client.defaults.headers.common["Authorization"] = "";
      window.location.reload();
    }
  },

  logOut: async () => {
    set({ user: null });
    localStorage.removeItem(AUTH_TOKEN_KEY);
    await HttpKit.removeClientToken();
  },
}));

export default useStore;
