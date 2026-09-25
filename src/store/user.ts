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
}

interface UserStoreAction {
    createChat: (context?: Attachment[]) => string;
    setActiveChat: (id: string) => void;
    addUserMessage: (chatId: string, content: string, attachments?: Attachment[]) => void;
    addAssistantMessage: (chatId: string, payload: Omit<AssistantMessage, "id" | "role" | "timestamp">) => void;

}

type UserStore = UserStoreState & UserStoreAction

export const useUserStore = create<UserStore>()(
    immer(set => ({
        chats: [],
        activeChatId: null,

        createChat: () => {

            return ""
        },
        setActiveChat: () => { },
        addUserMessage: () => { },
        addAssistantMessage: () => { }
    }))
)