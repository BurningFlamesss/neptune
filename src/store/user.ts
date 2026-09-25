import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

interface BaseMessage {
    id: string;
    timestamp: number;
}

interface UserMessage extends BaseMessage {
    role: "user";
    content: string;
}

type Message = UserMessage

interface ChatCapsule {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
}

interface UserStoreState {
    chats: ChatCapsule[];
    activeChatId: string | null;
}

type UserStore = UserStoreState

export const useUserStore = create<UserStore>()(
    immer(set => ({
        chats: [],
        activeChatId: null
    }))
)