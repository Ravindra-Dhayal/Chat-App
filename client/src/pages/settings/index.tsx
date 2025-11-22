import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { LANGUAGES } from "@/constants";
import ThemeSelector from "@/components/theme-selector";
import NotificationsPanel from "@/components/notifications-panel";
import { Download, Bell, Languages, Palette, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/hooks/use-i18n";
import { useNavigate } from "react-router-dom";

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

  const { t } = useI18n();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("general");
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleLanguageClick = (lang: string) => {
    if (lang === language) return; // Don't show dialog if same language
    setSelectedLanguage(lang);
    setShowLanguageDialog(true);
  };

  const confirmLanguageChange = () => {
    if (selectedLanguage) {
      setLanguage(selectedLanguage);
    }
    setShowLanguageDialog(false);
    setSelectedLanguage(null);
  };

  const cancelLanguageChange = () => {
    setShowLanguageDialog(false);
    setSelectedLanguage(null);
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 relative">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-base-content">Settings</h1>
          <p className="text-sm sm:text-base text-base-content/70">Customize your chat app experience</p>
          
          {/* Close Button */}
          <button
            onClick={() => navigate("/")}
            className="absolute top-0 right-0 p-2 rounded-lg hover:bg-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close settings"
          >
            <X className="h-6 w-6 text-base-content" />
          </button>
        </div>

        {/* Navigation Tabs - Horizontal on mobile, Sidebar on desktop */}
        <div className="flex lg:hidden gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "general", label: "General", icon: Palette },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "downloads", label: "Downloads", icon: Download },
            { id: "language", label: "Language", icon: Languages },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap min-h-[44px] ${activeTab === tab.id
                    ? "bg-primary text-primary-content"
                    : "text-base-content/80 bg-base-200 hover:bg-base-300"
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop and Mobile Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation - Desktop only */}
          <div className="hidden lg:block lg:col-span-1 space-y-2 h-fit sticky top-4">
                {[
                  {
                    id: "general",
                    labelKey: "settings.tab.general",
                    defaultLabel: "General",
                    icon: Palette,
                  },
                  {
                    id: "notifications",
                    labelKey: "settings.tab.notifications",
                    defaultLabel: "Notifications",
                    icon: Bell,
                  },
                  {
                    id: "downloads",
                    labelKey: "settings.tab.downloads",
                    defaultLabel: "Auto Downloads",
                    icon: Download,
                  },
                  {
                    id: "language",
                    labelKey: "settings.tab.language",
                    defaultLabel: "Language",
                    icon: Languages,
                  },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left min-h-[44px] ${activeTab === tab.id
                          ? "bg-primary text-primary-content"
                          : "text-base-content/80 hover:bg-base-200"
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">
                        {t(tab.labelKey, tab.defaultLabel)}
                      </span>
                    </button>
                  );
                })}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
                <div className="rounded-2xl p-4 sm:p-6 lg:p-8 border border-base-300 bg-base-200">
                  {/* General Tab - Theme */}
                  {activeTab === "general" && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 text-base-content">
                        {t("settings.appearance.title", "Appearance")}
                      </h2>
                      <ThemeSelector />
                    </div>
                  )}

                  {/* Notifications Tab */}
                  {activeTab === "notifications" && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 text-base-content">
                        {t(
                          "settings.notifications.title",
                          "Notification Settings"
                        )}
                      </h2>
                      <NotificationsPanel />
                    </div>
                  )}

                  {/* Auto Downloads Tab */}
                  {activeTab === "downloads" && (
                    <div className="space-y-4 sm:space-y-6">
                      <h2 className="text-2xl font-bold mb-6 text-base-content">
                        {t(
                          "settings.autoDownloads.title",
                          "Auto Download Settings"
                        )}
                      </h2>

                      <div className="space-y-4">
                        {/* Photos Download */}
                        <div className="flex items-center justify-between p-4 rounded-lg border border-base-300 bg-base-100 hover:bg-base-200 transition-colors">
                          <div>
                            <h3 className="font-semibold">
                              {t(
                                "settings.autoDownloads.photos.title",
                                "Auto-download Photos"
                              )}
                            </h3>
                            <p className="text-sm text-base-content/70">
                              {t(
                                "settings.autoDownloads.photos.description",
                                "Automatically download incoming photos"
                              )}
                            </p>
                          </div>
                          <Switch
                            checked={autoDownloadPhotos}
                            onCheckedChange={setAutoDownloadPhotos}
                          />
                        </div>

                        {/* Videos Download */}
                        <div className="flex items-center justify-between p-4 rounded-lg border border-base-300 bg-base-100 hover:bg-base-200 transition-colors">
                          <div>
                            <h3 className="font-semibold">
                              {t(
                                "settings.autoDownloads.videos.title",
                                "Auto-download Videos"
                              )}
                            </h3>
                            <p className="text-sm text-base-content/70">
                              {t(
                                "settings.autoDownloads.videos.description",
                                "Automatically download incoming videos"
                              )}
                            </p>
                          </div>
                          <Switch
                            checked={autoDownloadVideos}
                            onCheckedChange={setAutoDownloadVideos}
                          />
                        </div>

                        {/* Documents Download */}
                        <div className="flex items-center justify-between p-4 rounded-lg border border-base-300 bg-base-100 hover:bg-base-200 transition-colors">
                          <div>
                            <h3 className="font-semibold">
                              {t(
                                "settings.autoDownloads.documents.title",
                                "Auto-download Documents"
                              )}
                            </h3>
                            <p className="text-sm text-base-content/70">
                              {t(
                                "settings.autoDownloads.documents.description",
                                "Automatically download incoming documents"
                              )}
                            </p>
                          </div>
                          <Switch
                            checked={autoDownloadDocuments}
                            onCheckedChange={setAutoDownloadDocuments}
                          />
                        </div>

                        <div className="p-4 rounded-lg bg-primary/10">
                          <p className="text-sm text-primary">
                            {t(
                              "settings.autoDownloads.tip",
                              "Tip: Auto-download settings will help save your mobile data while keeping your favorite files accessible."
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Language Tab */}
                  {activeTab === "language" && (
                    <div className="space-y-4 sm:space-y-6">
                      <h2 className="text-2xl font-bold mb-6 text-base-content">
                        {t(
                          "settings.language.title",
                          "Language Preferences"
                        )}
                      </h2>

                      <div className="p-4 rounded-lg bg-success/10">
                        <p className="text-sm text-success">
                          ✓ Current Language: <strong>{language}</strong>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang}
                            onClick={() => handleLanguageClick(lang)}
                            className={`p-3 rounded-lg border-2 transition text-left ${language === lang
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-base-300 hover:border-base-400"
                              }`}
                          >
                            <span className="font-medium">{lang}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
          </div>
        </div>

        {/* Language Confirmation Dialog */}
          {showLanguageDialog && (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] animate-in fade-in duration-200"
                onClick={cancelLanguageChange}
              />

              {/* Dialog */}
              <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10001] w-[90%] max-w-md animate-in fade-in zoom-in duration-200">
                <div className="bg-card border border-border rounded-2xl shadow-2xl p-6">
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    Change Language?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Do you want to change the language to <strong className="text-foreground">{selectedLanguage}</strong>?
                    <br />
                    <span className="text-xs mt-2 block text-warning">
                      Note: This will only save your preference. Full language translation is not yet implemented.
                    </span>
                  </p>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={cancelLanguageChange}
                      className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent transition-colors font-medium min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmLanguageChange}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium min-h-[44px]"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
      </div>
    </div>
  );
};

export default Settings;