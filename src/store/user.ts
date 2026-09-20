import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

interface User {
    plan_name: string;
    update: (entry: "plan_name", data: string) => void;
}

export const userStore = create<User>()(
    immer(set => ({
        plan_name: "",
        update(entry, data) {
            set((state) => {
                state[entry] = data
            })
        }
    }))
)