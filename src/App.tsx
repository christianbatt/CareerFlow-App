import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { KanbanBoard } from "./components/KanbanBoard";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { CoverLetterStudio } from "./components/CoverLetterStudio";
import { CalendarDeadlines } from "./components/CalendarDeadlines";
import { DocumentsVault } from "./components/DocumentsVault";
import { JobHunterModule } from "./components/JobHunterModule";
import { JobImportModal } from "./components/JobImportModal";
import { ApplicationDetailModal } from "./components/ApplicationDetailModal";
import { InterviewCoachModal } from "./components/InterviewCoachModal";
import { VoiceCommandModal } from "./components/VoiceCommandModal";
import { BackupModal } from "./components/BackupModal";
import { FollowUpGeneratorModal } from "./components/FollowUpGeneratorModal";
import { InstallAppModal } from "./components/InstallAppModal";
import { AutoApplyModal } from "./components/AutoApplyModal";
import { CareerCopilotDrawer, CareerCopilotDockButton } from "./components/CareerCopilotDrawer";

const MainContent: React.FC = () => {
  const {
    activeTab,
    isCopilotOpen,
    openCopilot,
    closeCopilot,
    copilotMode,
    copilotInitialPrompt,
  } = useApp();

  // Global keyboard shortcut: Cmd+K or Ctrl+K to toggle Copilot
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isCopilotOpen) {
          closeCopilot();
        } else {
          openCopilot();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCopilotOpen, openCopilot, closeCopilot]);

  return (
    <main className="min-h-[calc(100vh-4rem)] relative">
      {activeTab === "kanban" && <KanbanBoard />}
      {activeTab === "analytics" && <AnalyticsDashboard />}
      {activeTab === "cover-letter" && <CoverLetterStudio />}
      {activeTab === "deadlines" && <CalendarDeadlines />}
      {activeTab === "documents" && <DocumentsVault />}
      {activeTab === "job-hunter" && <JobHunterModule />}

      {/* Global Modals */}
      <JobImportModal />
      <ApplicationDetailModal />
      <InterviewCoachModal />
      <VoiceCommandModal />
      <BackupModal />
      <FollowUpGeneratorModal />
      <InstallAppModal />
      <AutoApplyModal />

      {/* Unified AI Career Copilot Drawer & Dock */}
      <CareerCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={closeCopilot}
        defaultMode={copilotMode}
        initialPrompt={copilotInitialPrompt}
      />
      <CareerCopilotDockButton
        isOpen={isCopilotOpen}
        onClick={() => (isCopilotOpen ? closeCopilot() : openCopilot())}
      />
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-stone-100/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors">
        <Header />
        <MainContent />
      </div>
    </AppProvider>
  );
}
