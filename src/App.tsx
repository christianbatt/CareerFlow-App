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

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="min-h-[calc(100vh-4rem)]">
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
