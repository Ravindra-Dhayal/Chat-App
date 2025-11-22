import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MessageType } from "@/types/chat.type";

interface SavedMessage extends MessageType {
  savedAt: string;
  chatName?: string;
}

interface SavedMessagesState {
  savedMessages: SavedMessage[];
  saveMessage: (message: MessageType, chatId?: string, chatName?: string) => void;
  unsaveMessage: (messageId: string) => void;
  isMessageSaved: (messageId: string) => boolean;
  getSavedMessages: () => SavedMessage[];
  clearSavedMessages: () => void;
}

export const useSavedMessages = create<SavedMessagesState>()(
  persist(
    (set, get) => ({
      savedMessages: [],

      saveMessage: (message, chatId, chatName) => {
        const savedMessage: SavedMessage = {
          ...message,
          chatId: chatId || message.chatId,
          savedAt: new Date().toISOString(),
          chatName,
        };
        set((state) => ({
          savedMessages: [savedMessage, ...state.savedMessages],
        }));
      },

      unsaveMessage: (messageId) => {
        set((state) => ({
          savedMessages: state.savedMessages.filter(
            (msg) => msg._id !== messageId
          ),
        }));
      },

      isMessageSaved: (messageId) => {
        return get().savedMessages.some((msg) => msg._id === messageId);
      },

      getSavedMessages: () => {
        return get().savedMessages;
      },

      clearSavedMessages: () => {
        set({ savedMessages: [] });
      },
    }),
    {
      name: "saved-messages-storage",
    }
  )
);
