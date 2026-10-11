import React from "react";
import {
  Kanban,
  BarChart3,
  FileText,
  Calendar,
  UserCheck,
  Plus,
  Sparkles,
  Mic,
  Moon,
  Sun,
  Cloud,
  WifiOff,
  Globe,
  Mail,
  Zap,
  Monitor,
  Bot,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { SupportedLanguage } from "../types";

export const Header: React.FC = () => {
  const {
    applications,
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    t,
    darkMode,
    toggleDarkMode,
    isOnline,
    setActiveModal,
    isCopilotOpen,
    openCopilot,
    closeCopilot,
  } = useApp();

  // Count applications that have been waiting >= 7 days
  const dueCount = applications.filter((app) => {
    if (app.stage === "offered" || app.stage === "rejected" || app.stage === "wishlist") return false;
    const timestamp = app.dateApplied
      ? new Date(app.dateApplied).getTime()
      : new Date(app.createdAt).getTime();
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    return days >= 7;
  }).length;

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md">
      {/* Offline banner if offline */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>{t.offline}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-900 dark:text-stone-100 text-base tracking-tight">
                  CareerFlow
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
                  AI OS
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block truncate max-w-xs">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Links (Tabs) */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === "kanban"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>{t.kanban}</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === "analytics"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{t.analytics}</span>
            </button>

            <button
              onClick={() => setActiveTab("cover-letter")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === "cover-letter"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.coverLetters}</span>
            </button>

            <button
              onClick={() => setActiveTab("deadlines")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === "deadlines"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.deadlines}</span>
            </button>

            <button
              onClick={() => setActiveTab("documents")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === "documents"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t.documents}</span>
            </button>

            <button
              onClick={() => setActiveTab("job-hunter")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === "job-hunter"
                  ? "bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t.jobHunter || "Job Hunter AI"}</span>
            </button>
          </nav>

          {/* Quick Actions & Preferences */}
          <div className="flex items-center gap-2">
            {/* Career Copilot AI Launcher */}
            <button
              onClick={() => (isCopilotOpen ? closeCopilot() : openCopilot("job-hunter"))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isCopilotOpen
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/40"
              }`}
              title="Apri Career Copilot AI (Ctrl+K)"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Copilot AI</span>
            </button>

            {/* AI Job Extraction Button */}
            <button
              onClick={() => setActiveModal("import")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-all shadow-xs"
              title={t.importModalTitle}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.importWithAI}</span>
              <span className="sm:hidden">+ AI</span>
            </button>

            {/* Quick Add Blank Application */}
            <button
              onClick={() => {
                setActiveModal("details");
              }}
              className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
              title={t.quickAdd}
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Automated Follow-up Generator Button */}
            <button
              onClick={() => setActiveModal("followUp")}
              className="relative p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
              title="Follow-up Email Generator Automatico"
            >
              <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              {dueCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {dueCount}
                </span>
              )}
            </button>

            {/* Voice Command trigger */}
            <button
              onClick={() => setActiveModal("voice")}
              className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
              title={t.voiceCommands}
            >
              <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* Desktop App Install Button */}
            <button
              onClick={() => setActiveModal("installApp")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold transition-colors"
              title="Installa come App su Desktop / PC"
            >
              <Monitor className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden lg:inline">Installa Desktop</span>
            </button>

            {/* Cloud Sync / Backup */}
            <button
              onClick={() => setActiveModal("backup")}
              className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
              title={t.cloudSync}
            >
              <Cloud className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 absolute left-2 text-stone-400 pointer-events-none" />
              <select
                aria-label="Language selection"
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="pl-6 pr-2 py-1 text-xs bg-stone-100 dark:bg-stone-800 border-none rounded-lg text-stone-700 dark:text-stone-300 font-medium cursor-pointer focus:ring-1 focus:ring-indigo-500"
              >
                <option value="it">IT</option>
                <option value="en">EN</option>
                <option value="fr">FR</option>
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto gap-1 py-2 border-t border-stone-100 dark:border-stone-800 scrollbar-none">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === "kanban"
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400"
                : "text-stone-600 dark:text-stone-400"
            }`}
          >
            {t.kanban}
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === "analytics"
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400"
                : "text-stone-600 dark:text-stone-400"
            }`}
          >
            {t.analytics}
          </button>
          <button
            onClick={() => setActiveTab("cover-letter")}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === "cover-letter"
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400"
                : "text-stone-600 dark:text-stone-400"
            }`}
          >
            {t.coverLetters}
          </button>
          <button
            onClick={() => setActiveTab("deadlines")}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === "deadlines"
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400"
                : "text-stone-600 dark:text-stone-400"
            }`}
          >
            {t.deadlines}
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === "documents"
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400"
                : "text-stone-600 dark:text-stone-400"
            }`}
          >
            {t.documents}
          </button>
          <button
            onClick={() => setActiveTab("job-hunter")}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === "job-hunter"
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold"
                : "text-stone-600 dark:text-stone-400"
            }`}
          >
            {t.jobHunter || "Job Hunter AI"}
          </button>
        </div>
      </div>
    </header>
  );
};
