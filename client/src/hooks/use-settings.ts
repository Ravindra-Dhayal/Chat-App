import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "message" | "update" | "system";
  timestamp: Date;
  read: boolean;
}

interface SettingsState {
  language: string;
  autoDownloadPhotos: boolean;
  autoDownloadVideos: boolean;
  autoDownloadDocuments: boolean;
  notifications: Notification[];
  notificationsEnabled: boolean;

  setLanguage: (language: string) => void;
  setAutoDownloadPhotos: (enabled: boolean) => void;
  setAutoDownloadVideos: (enabled: boolean) => void;
  setAutoDownloadDocuments: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export const useSettings = create<SettingsState>()((set) => ({
  language: localStorage.getItem("chat-app-language") || "English",
  autoDownloadPhotos: JSON.parse(localStorage.getItem("chat-app-auto-download-photos") || "false"),
  autoDownloadVideos: JSON.parse(localStorage.getItem("chat-app-auto-download-videos") || "false"),
  autoDownloadDocuments: JSON.parse(localStorage.getItem("chat-app-auto-download-documents") || "false"),
  notifications: [],
  notificationsEnabled: JSON.parse(localStorage.getItem("chat-app-notifications-enabled") || "true"),

  setLanguage: (language: string) => {
    localStorage.setItem("chat-app-language", language);
    set({ language });
  },

  setAutoDownloadPhotos: (enabled: boolean) => {
    localStorage.setItem("chat-app-auto-download-photos", JSON.stringify(enabled));
    set({ autoDownloadPhotos: enabled });
  },

  setAutoDownloadVideos: (enabled: boolean) => {
    localStorage.setItem("chat-app-auto-download-videos", JSON.stringify(enabled));
    set({ autoDownloadVideos: enabled });
  },

  setAutoDownloadDocuments: (enabled: boolean) => {
    localStorage.setItem("chat-app-auto-download-documents", JSON.stringify(enabled));
    set({ autoDownloadDocuments: enabled });
  },

  setNotificationsEnabled: (enabled: boolean) => {
    localStorage.setItem("chat-app-notifications-enabled", JSON.stringify(enabled));
    set({ notificationsEnabled: enabled });
  },

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}`,
      timestamp: new Date(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },

  markNotificationAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      ),
    }));
  },

  clearNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((notif) => notif.id !== id),
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },
}));
