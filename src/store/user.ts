import type { GetUserPlan } from "#/functions/payment";
import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

interface User {
    plan: GetUserPlan;
    update: (entry: "plan", data: any) => void;
}

export const userStore = create<User>()(
    immer(set => ({
        plan: null,
        update(entry, data) {
            set((state) => {
                state[entry] = data
            })
        }
    }))
)