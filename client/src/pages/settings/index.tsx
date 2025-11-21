import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { LANGUAGES } from "@/constants";
import ThemeSelector from "@/components/theme-selector";
import NotificationsPanel from "@/components/notifications-panel";
import { Download, Bell, Languages, Palette } from "lucide-react";

const Settings = () => {
  const {
    language,
    setLanguage,
    autoDownloadPhotos,
    autoDownloadVideos,
    autoDownloadDocuments,
    setAutoDownloadPhotos,
    setAutoDownloadVideos,
    setAutoDownloadDocuments,
  } = useSettings();

  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-base-content">Settings</h1>
          <p className="text-base-content/70">Customize your chat app experience</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-2 h-fit lg:sticky lg:top-4">
            {[
              { id: "general", label: "General", icon: Palette },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "downloads", label: "Auto Downloads", icon: Download },
              { id: "language", label: "Language", icon: Languages },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-content"
                      : "text-base-content/80 hover:bg-base-200"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl p-8 border border-base-300 bg-base-200">
              {/* General Tab - Theme */}
              {activeTab === "general" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-base-content">Appearance</h2>
                  <ThemeSelector />
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-base-content">Notification Settings</h2>
                  <NotificationsPanel />
                </div>
              )}

              {/* Auto Downloads Tab */}
              {activeTab === "downloads" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-base-content">Auto Download Settings</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Photos Download */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-base-300 bg-base-100 hover:bg-base-200 transition-colors">
                      <div>
                        <h3 className="font-semibold">Auto-download Photos</h3>
                        <p className="text-sm text-base-content/70">Automatically download incoming photos</p>
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoDownloadPhotos}
                          onChange={(e) => setAutoDownloadPhotos(e.target.checked)}
                          className="checkbox"
                        />
                      </label>
                    </div>

                    {/* Videos Download */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-base-300 bg-base-100 hover:bg-base-200 transition-colors">
                      <div>
                        <h3 className="font-semibold">Auto-download Videos</h3>
                        <p className="text-sm text-base-content/70">Automatically download incoming videos</p>
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoDownloadVideos}
                          onChange={(e) => setAutoDownloadVideos(e.target.checked)}
                          className="checkbox"
                        />
                      </label>
                    </div>

                    {/* Documents Download */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-base-300 bg-base-100 hover:bg-base-200 transition-colors">
                      <div>
                        <h3 className="font-semibold">Auto-download Documents</h3>
                        <p className="text-sm text-base-content/70">Automatically download incoming documents</p>
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoDownloadDocuments}
                          onChange={(e) => setAutoDownloadDocuments(e.target.checked)}
                          className="checkbox"
                        />
                      </label>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/10">
                      <p className="text-sm text-primary">
                        💡 Tip: Like Telegram, auto-download settings will help save your mobile data while keeping your favorite files accessible.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Language Tab */}
              {activeTab === "language" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-base-content">Language Preferences</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`p-3 rounded-lg border-2 transition text-left ${
                          language === lang
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-base-300 hover:border-base-400"
                        }`}
                      >
                        <span className="font-medium">{lang}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-4 rounded-lg bg-success/10">
                    <p className="text-sm text-success">
                      ✓ Current Language: <strong>{language}</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
