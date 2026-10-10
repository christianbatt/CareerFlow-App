import React, { useState } from "react";
import {
  Search,
  Plus,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  GraduationCap,
} from "lucide-react";
import { ApplicationStage, JobApplication } from "../types";
import { useApp } from "../context/AppContext";
import { ApplicationCard } from "./ApplicationCard";

const STAGES: { key: ApplicationStage; colorClass: string; dotColor: string }[] = [
  { key: "wishlist", colorClass: "border-stone-300 dark:border-stone-700", dotColor: "bg-stone-400" },
  { key: "applied", colorClass: "border-blue-400 dark:border-blue-600", dotColor: "bg-blue-500" },
  { key: "screening", colorClass: "border-purple-400 dark:border-purple-600", dotColor: "bg-purple-500" },
  { key: "interviewing", colorClass: "border-amber-400 dark:border-amber-600", dotColor: "bg-amber-500" },
  { key: "offered", colorClass: "border-emerald-500 dark:border-emerald-600", dotColor: "bg-emerald-500" },
  { key: "rejected", colorClass: "border-rose-300 dark:border-rose-800", dotColor: "bg-rose-400" },
];

export const KanbanBoard: React.FC = () => {
  const {
    applications,
    moveStage,
    t,
    searchQuery,
    setSearchQuery,
    workplaceFilter,
    setWorkplaceFilter,
    priorityFilter,
    setPriorityFilter,
    setActiveModal,
    setSelectedApplication,
    setActiveTab,
  } = useApp();

  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<ApplicationStage | null>(null);

  // Filter applications
  const filteredApps = applications.filter((app) => {
    // Search query matching title, company, skills
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCompany = app.company.toLowerCase().includes(q);
      const matchTitle = app.title.toLowerCase().includes(q);
      const matchSkill = app.requiredSkills.some((s) => s.toLowerCase().includes(q));
      if (!matchCompany && !matchTitle && !matchSkill) return false;
    }

    // Workplace filter
    if (workplaceFilter !== "all" && app.workplaceType !== workplaceFilter) {
      return false;
    }

    // Priority filter
    if (priorityFilter !== "all" && app.priority !== priorityFilter) {
      return false;
    }

    return true;
  });

  const handleDragStart = (_e: React.DragEvent, id: string) => {
    setDraggedAppId(id);
  };

  const handleDragOver = (e: React.DragEvent, stage: ApplicationStage) => {
    e.preventDefault();
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: ApplicationStage) => {
    e.preventDefault();
    if (draggedAppId) {
      moveStage(draggedAppId, targetStage);
    }
    setDraggedAppId(null);
    setDragOverStage(null);
  };

  const handleCreateInStage = (stage: ApplicationStage) => {
    const emptyApp: Partial<JobApplication> = {
      stage,
      title: "",
      company: "",
      location: "",
      workplaceType: "Remote",
      requiredSkills: [],
      interviews: [],
    };
    setSelectedApplication(emptyApp as JobApplication);
    setActiveModal("details");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Onboarding Welcome Banner when zero applications */}
      {applications.length === 0 && (
        <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/40 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2.5 text-indigo-900 dark:text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              <strong>Workspace pronto per il tuo profilo reale:</strong> Nessuna candidatura presente. Carica il tuo CV in <strong>Job Hunter AI</strong> per trovare offerte reali su misura per te, oppure inserisci manualmente le tue posizioni.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("job-hunter")}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              Esplora Offerte con AI
            </button>
            <button
              onClick={() => handleCreateInStage("wishlist")}
              className="px-3 py-1 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-lg font-medium transition-colors"
            >
              + Nuova Candidatura
            </button>
          </div>
        </div>
      )}

      {/* Top Filter and Search Bar */}
      <div className="shrink-0 p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtri:</span>
            </div>

            {/* Workplace Select */}
            <select
              aria-label="Filtra per modalità di lavoro"
              value={workplaceFilter}
              onChange={(e) => setWorkplaceFilter(e.target.value)}
              className="text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">{t.allWorkplaces}</option>
              <option value="Remote">{t.filterRemote}</option>
              <option value="Hybrid">{t.filterHybrid}</option>
              <option value="On-site">{t.filterOnsite}</option>
            </select>

            {/* Priority Select */}
            <select
              aria-label="Filtra per priorità"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">{t.allPriorities}</option>
              <option value="high">{t.priorityHigh}</option>
              <option value="medium">{t.priorityMed}</option>
              <option value="low">{t.priorityLow}</option>
            </select>

            {/* Quick Extraction Button */}
            <button
              onClick={() => setActiveModal("import")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.importWithAI}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Columns Horizontal Scrolling Container */}
      <div className="flex-1 overflow-x-auto p-4 sm:p-6 bg-stone-100/70 dark:bg-stone-950/70 scrollbar-thin">
        <div className="flex gap-4 min-h-full items-start pb-4">
          {STAGES.map((col) => {
            const stageApps = filteredApps.filter((a) => a.stage === col.key);
            const isTarget = dragOverStage === col.key;

            return (
              <div
                key={col.key}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.key)}
                className={`flex flex-col w-80 shrink-0 bg-stone-50 dark:bg-stone-900/90 border rounded-2xl p-3 transition-colors max-h-[calc(100vh-10rem)] ${
                  isTarget
                    ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 ring-2 ring-indigo-400/30"
                    : "border-stone-200 dark:border-stone-800"
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-200/80 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      {t[`stage_${col.key}`] || col.key}
                    </h2>
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                      {stageApps.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {col.key === "wishlist" && (
                      <button
                        onClick={() => setActiveTab("analytics")}
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 flex items-center gap-1 transition-colors"
                        title="Apri Skill Gap Analysis"
                      >
                        <GraduationCap className="w-3 h-3" />
                        <span>Skill Gap</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCreateInStage(col.key)}
                      className="p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 rounded hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
                      title={t.addInStage}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {stageApps.length === 0 ? (
                    <div className="py-8 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl text-stone-400 dark:text-stone-600 text-xs">
                      <p>{t.emptyStage}</p>
                      <button
                        onClick={() => handleCreateInStage(col.key)}
                        className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-block"
                      >
                        {t.addInStage}
                      </button>
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <ApplicationCard
                        key={app.id}
                        application={app}
                        onDragStart={handleDragStart}
                      />
                    ))
                  )}
                </div>

                {/* Offer Celebratory footer on offered column */}
                {col.key === "offered" && stageApps.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-stone-200/70 dark:border-stone-800 text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ottimo lavoro! Offerta in corso</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
