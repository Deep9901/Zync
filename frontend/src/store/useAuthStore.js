import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
// import { io } from "socket.io-client";


export const useAuthStore = create(
    (set) => ({
        authUser: null,
        isSigningUp: false,
        isLoggingIn: false,
        isUpdatingProfile: false,

        isCheckingAuth: true,

        checkAuth: async () => {
            try {
                const res = await axiosInstance.get("/auth/check");

                set({ authUser: res.data });
            } catch (err) {
                console.error("Error in checkAuth", err.message);

                set({ authUser: null });
            } finally {
                set({ isCheckingAuth: false });
            }
        },

        signup: async (data) => {
            set({ isSigningUp: true });
            try {

                const res = await axiosInstance.post("/auth/signup", data);

                // user will be authenticated as soon as they signup
                set({ authUser: res.data });
                // user will be authenticated as soon as they signup

                // showing a toast for successfull signup
                toast.success("Account created successfully");
                // showing a toast for successfull signup

                // get().connectSocket();
            } catch (error) {

                // showing a toast for failed signup
                toast.error(error.response.data.message);

            } finally {
                set({ isSigningUp: false });
            }
        },

        login: async (data) => {
            set({ isLoggingIn: true });
            try {
                const res = await axiosInstance.post("/auth/login", data);
                set({ authUser: res.data });
                toast.success("Logged in successfully");

                get().connectSocket();
            } catch (error) {
                toast.error(error.response.data.message);
            } finally {
                set({ isLoggingIn: false });
            }
        },


        logout: async () => {
            try {
                await axiosInstance.post("/auth/logout");
                set({ authUser: null });
                toast.success("Logged out successfully");
                get().disconnectSocket();
            } catch (error) {
                toast.error(error.response.data.message);
            }
        },

        updateProfile: async (data) => {
            set({ isUpdatingProfile: true });
            try {
                const res = await axiosInstance.put("/auth/update-profile", data);
                set({ authUser: res.data });
                toast.success("Profile updated successfully");
            } catch (error) {
                console.log("error in update profile:", error);
                toast.error(error.response.data.message);
            } finally {
                set({ isUpdatingProfile: false });
            }
        },

    })
);