import React, { useState } from "react";
import {
  Building2,
  MapPin,
  ExternalLink,
  PlusCircle,
  FileText,
  Sparkles,
  Check,
  CheckCircle2,
  Coins,
  ShieldCheck,
  Send,
} from "lucide-react";
import { CopilotJobOffer } from "../types";
import { useApp } from "../context/AppContext";

export interface InteractiveJobCardProps {
  job: CopilotJobOffer;
  compact?: boolean;
  onAddedToKanban?: () => void;
  onOpenCvTailor?: () => void;
  onOpenCoverLetter?: () => void;
}

export const InteractiveJobCard: React.FC<InteractiveJobCardProps> = ({
  job,
  compact = false,
  onAddedToKanban,
  onOpenCvTailor,
  onOpenCoverLetter,
}) => {
  const { addApplication, applications, setActiveTab, setSelectedApplication, showToast, triggerConfetti } =
    useApp();
  const [isSaved, setIsSaved] = useState(() =>
    applications.some(
      (app) =>
        (app.sourceUrl && app.sourceUrl === job.jobUrl) ||
        (app.company.toLowerCase() === job.company.toLowerCase() &&
          app.title.toLowerCase() === job.title.toLowerCase())
    )
  );

  const determineWorkplaceType = (loc: string): "Remote" | "Hybrid" | "On-site" => {
    const l = loc.toLowerCase();
    if (l.includes("remote") || l.includes("remoto")) return "Remote";
    if (l.includes("hybrid") || l.includes("ibrido")) return "Hybrid";
    return "On-site";
  };

  const handleSaveToKanban = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      showToast(`Posizione già presente nel tuo Kanban (${job.company})`, "info");
      return;
    }

    addApplication({
      company: job.company,
      title: job.title,
      location: job.location,
      workplaceType: determineWorkplaceType(job.location),
      salary: job.salary || "Non specificato",
      stage: "wishlist",
      sourceUrl: job.jobUrl,
      sourcePlatform: job.atsSystem
        ? `${job.atsSystem} ATS`
        : job.portal || "Careers Aziendale",
      jobDescription: job.description || job.matchReasoning || "",
      requiredSkills: job.matchedSkills || [],
      responsibilities: [],
      interviews: [],
      notes: `Identificato da Gemini Copilot con match del ${job.matchScore}%. ${job.matchReasoning || ""}`,
    });

    setIsSaved(true);
    triggerConfetti();
    showToast(`"${job.title}" presso ${job.company} salvato nel Kanban!`, "success");
    onAddedToKanban?.();
  };

  const handleTailorCv = (e: React.MouseEvent) => {
    e.stopPropagation();
    let existingApp = applications.find(
      (app) =>
        (app.sourceUrl && app.sourceUrl === job.jobUrl) ||
        (app.company.toLowerCase() === job.company.toLowerCase() &&
          app.title.toLowerCase() === job.title.toLowerCase())
    );

    if (!existingApp) {
      const created = addApplication({
        company: job.company,
        title: job.title,
        location: job.location,
        workplaceType: determineWorkplaceType(job.location),
        salary: job.salary || "Non specificato",
        stage: "wishlist",
        sourceUrl: job.jobUrl,
        sourcePlatform: job.atsSystem || job.portal || "Careers Aziendale",
        jobDescription: job.description || job.matchReasoning || "",
        requiredSkills: job.matchedSkills || [],
        responsibilities: [],
        interviews: [],
        notes: `Posizione selezionata per ottimizzazione CV dal Copilot.`,
      });
      setIsSaved(true);
      setSelectedApplication(created);
    } else {
      setSelectedApplication(existingApp);
    }

    setActiveTab("documents");
    showToast(`Apertura Documents Vault per adattare il CV a ${job.company}`, "info");
    onOpenCvTailor?.();
  };

  const handleCoverLetter = (e: React.MouseEvent) => {
    e.stopPropagation();
    let existingApp = applications.find(
      (app) =>
        (app.sourceUrl && app.sourceUrl === job.jobUrl) ||
        (app.company.toLowerCase() === job.company.toLowerCase() &&
          app.title.toLowerCase() === job.title.toLowerCase())
    );

    if (!existingApp) {
      const created = addApplication({
        company: job.company,
        title: job.title,
        location: job.location,
        workplaceType: determineWorkplaceType(job.location),
        salary: job.salary || "Non specificato",
        stage: "wishlist",
        sourceUrl: job.jobUrl,
        sourcePlatform: job.atsSystem || job.portal || "Careers Aziendale",
        jobDescription: job.description || job.matchReasoning || "",
        requiredSkills: job.matchedSkills || [],
        responsibilities: [],
        interviews: [],
      });
      setIsSaved(true);
      setSelectedApplication(created);
    } else {
      setSelectedApplication(existingApp);
    }

    setActiveTab("cover-letter");
    showToast(`Apertura Cover Letter Studio per ${job.company}`, "info");
    onOpenCoverLetter?.();
  };

  const atsLabel =
    job.atsSystem === "Greenhouse"
      ? "Greenhouse ATS"
      : job.atsSystem === "Lever"
      ? "Lever Jobs"
      : job.atsSystem === "Workday"
      ? "Workday Portal"
      : job.atsSystem === "SmartRecruiters"
      ? "SmartRecruiters"
      : job.isDirectCareerPage
      ? "Pagina Careers Ufficiale"
      : job.portal || "Careers";

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";
    if (score >= 75) return "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800";
    return "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800";
  };

  return (
    <div
      className={`rounded-2xl border transition-all ${
        compact
          ? "p-3 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-2xs"
          : "p-4 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700"
      }`}
    >
      {/* Header: Company, Title & Match Score */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-stone-500 mb-0.5">
            <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1 truncate">
              <Building2 className="w-3 h-3 text-stone-400 shrink-0" />
              {job.company}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
              {job.location || "Remoto / Ibrido"}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
              {atsLabel}
            </span>
          </div>

          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug truncate">
            {job.title}
          </h4>
        </div>

        {/* Match Score Badge */}
        {job.matchScore > 0 && (
          <div
            className={`shrink-0 px-2 py-1 rounded-xl border text-[11px] font-extrabold flex items-center gap-1 ${getScoreColor(
              job.matchScore
            )}`}
          >
            <Sparkles className="w-3 h-3" />
            <span className="font-mono tabular-nums">{job.matchScore}%</span>
          </div>
        )}
      </div>

      {/* Salary & Context Details */}
      {(job.salary || job.matchReasoning) && (
        <div className="mt-2 text-xs space-y-1">
          {job.salary && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
              <Coins className="w-3 h-3" />
              <span>{job.salary}</span>
            </div>
          )}
          {job.matchReasoning && (
            <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
              {job.matchReasoning}
            </p>
          )}
        </div>
      )}

      {/* Matched Skills */}
      {job.matchedSkills && job.matchedSkills.length > 0 && (
        <div className="mt-2.5 flex items-center gap-1 flex-wrap">
          {job.matchedSkills.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
            >
              {skill}
            </span>
          ))}
          {job.matchedSkills.length > 4 && (
            <span className="text-[10px] text-stone-400">
              +{job.matchedSkills.length - 4} altre
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* 1. Add to Kanban Button */}
          <button
            type="button"
            onClick={handleSaveToKanban}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              isSaved
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Salvato</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Salva Kanban</span>
              </>
            )}
          </button>

          {/* 2. Tailor CV Button */}
          <button
            type="button"
            onClick={handleTailorCv}
            className="px-2 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            title="Adatta il tuo CV a questo ruolo"
          >
            <FileText className="w-3 h-3 text-indigo-500" />
            <span>Adatta CV</span>
          </button>

          {/* 3. Cover Letter Button */}
          <button
            type="button"
            onClick={handleCoverLetter}
            className="px-2 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            title="Scrivi lettera di motivazione mirata"
          >
            <Send className="w-3 h-3 text-purple-500" />
            <span>Lettera</span>
          </button>
        </div>

        {/* 4. Official Offer Link */}
        {job.jobUrl && (
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-stone-600 dark:text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold flex items-center gap-1 hover:underline ml-auto py-1"
          >
            <span>Apri Offerta</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};
