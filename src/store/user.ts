import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

type AttachmentType = "image" | "file" | "document" | "collection"

interface Attachment {
    id: string;
    type: AttachmentType;
    name: string;
    url?: string;
    mimeType?: string;
}

interface BaseMessage {
    id: string;
    timestamp: number;
}

interface UserMessage extends BaseMessage {
    role: "user";
    content: string;
    attachments: Attachment[];
}

interface AssistantMessage extends BaseMessage {
    role: "assistant";
    headline: string;
    details: string;

    resolutionStatus: "resolved" | "partly_resolved" | "unresolved"
}

type Message = UserMessage | AssistantMessage

interface ChatCapsule {
    id: string;
    title: string;
    messages: Message[];
    globalContext: Attachment[];
    createdAt: number;
    updatedAt: number;
}

interface UserStoreState {
    chats: ChatCapsule[];
    activeChatId: string | null;
    _hasHydrated: boolean;
}

interface UserStoreAction {
    createChat: (context?: Attachment[]) => string;
    setActiveChat: (id: string) => void;
    setGlobalContext: (chatId: string, context: Attachment[]) => void;
    deleteChat: (id: string) => void;
    clearAllChats: () => void;
    addUserMessage: (chatId: string, content: string, attachments?: Attachment[]) => void;
    addAssistantMessage: (chatId: string, payload: Omit<AssistantMessage, "id" | "role" | "timestamp">) => void;
    setHasHydrated: (state: boolean) => void;
}

type UserStore = UserStoreState & UserStoreAction

export const useUserStore = create<UserStore>()(
    immer(set => ({
        chats: [],
        activeChatId: null,
        _hasHydrated: false,

        setHasHydrated: (state) => {
            set((draft) => {
                draft._hasHydrated = state
            })
        },

        createChat: (context = []) => {
            const newId = crypto.randomUUID()
            const now = Date.now()

            set((state) => {
                state.chats.push({
                    id: newId,
                    title: "New Recall Session",
                    messages: [],
                    globalContext: context,
                    createdAt: now,
                    updatedAt: now
                })
            })
            return newId
        },
        setActiveChat: (id) => {
            set((state) => {
                state.activeChatId = id
            })
        },
        setGlobalContext: (chatId, context) => {
            set((state) => {
                const chat = state.chats.find(chat => chat.id === chatId)

                if (chat) {
                    chat.globalContext = context
                    chat.updatedAt = Date.now()
                }
            })
        },
        deleteChat: (id) => {
            set((state) => {
                state.chats = state.chats.filter((chat) => chat.id !== id)

                if (state.activeChatId === id) {
                    state.activeChatId = state.chats?.[0].id ?? null
                }
            })
        },
        clearAllChats: () => {
            set((state) => {
                state.chats = []
                state.activeChatId = null
            })
        },
        addUserMessage: () => {

        },
        addAssistantMessage: () => { }
    }))
)