import { create } from "zustand";


const useSampleStore = create((set, get) => ({
    name: "",

    getName: () => {
        set({name: "John"})
    }
}))