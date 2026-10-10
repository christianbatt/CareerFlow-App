import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Sparkles,
  FileText,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Zap,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { JobApplication, ApplicationStage } from "../types";
import { useApp } from "../context/AppContext";
import { formatSalaryDisplay } from "../utils/salaryUtils";

interface ApplicationCardProps {
  application: JobApplication;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

const STAGE_ORDER: ApplicationStage[] = [
  "wishlist",
  "applied",
  "screening",
  "interviewing",
  "offered",
  "rejected",
];

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onDragStart,
}) => {
  const {
    t,
    setSelectedApplication,
    setActiveModal,
    setActiveTab,
    moveStage,
    openCoverLetterForApp,
    openInterviewCoachForApp,
    openAutoApplyForApp,
    updateApplicationVerification,
    showToast,
  } = useApp();

  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleVerifyLive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVerifying(true);
    try {
      const res = await fetch("/api/job-hunter/verify-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: application.title,
          company: application.company,
          location: application.location,
          portal: application.sourcePlatform || "Indeed",
          jobUrl: application.sourceUrl,
        }),
      });
      if (!res.ok) throw new Error("Errore durante la verifica");
      const data = await res.json();
      updateApplicationVerification(application.id, data);
      showToast(
        data.isVerified
          ? `✅ Offerta verificata reale al 100% online!`
          : `⚠️ Verifica completata: ${data.summary}`,
        data.isVerified ? "success" : "warning"
      );
    } catch {
      showToast("Impossibile verificare l'annuncio in questo momento.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const nextStageIndex = STAGE_ORDER.indexOf(application.stage) + 1;
  const nextStage = nextStageIndex < STAGE_ORDER.length ? STAGE_ORDER[nextStageIndex] : null;

  // Upcoming interview check
  const upcomingInterview = application.interviews.find(
    (i) => !i.completed && new Date(i.scheduledAt).getTime() > Date.now() - 3600000
  );

  // Check if deadline is approaching (< 5 days)
  const isDeadlineNear = (() => {
    if (!application.deadline) return false;
    const diff = new Date(application.deadline).getTime() - Date.now();
    return diff > 0 && diff < 5 * 24 * 60 * 60 * 1000;
  })();

  const handleCardClick = () => {
    setSelectedApplication(application);
    setActiveModal("details");
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, application.id)}
      onClick={handleCardClick}
      className="group relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 transition-all duration-200 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md cursor-grab active:cursor-grabbing text-left"
    >
      {/* Top Header: Company & Match / Source */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
            <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
              {application.company}
            </span>
            {application.sourcePlatform && (
              <>
                <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">
                  ·
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  {application.sourcePlatform}
                </span>
              </>
            )}
          </div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-0.5 leading-snug line-clamp-1">
            {application.title}
          </h3>
        </div>

        {/* Match Score Indicator */}
        {application.matchScore !== undefined && (
          <div
            className={`flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0 border ${
              application.matchScore >= 90
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : application.matchScore >= 80
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
            }`}
            title={`Affinità CV calcolata con AI: ${application.matchScore}%`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{application.matchScore}%</span>
          </div>
        )}
      </div>

      {/* Live AI Verification Badge if available */}
      {application.verification && (
        <div
          className={`my-1.5 px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center justify-between gap-1 ${
            application.verification.status === "verified_active"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/80"
              : application.verification.status === "alternative_active"
              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800/80"
              : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/80"
          }`}
          title={application.verification.summary}
        >
          <div className="flex items-center gap-1 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">
              {application.verification.status === "verified_active"
                ? "100% Reale Verificata Online"
                : application.verification.status === "alternative_active"
                ? "Azienda Online (Link Aggiornato)"
                : "Da Confermare"}
            </span>
          </div>
          <span className="text-[10px] font-bold opacity-75 shrink-0">
            {application.verification.confidence}%
          </span>
        </div>
      )}

      {/* Unboxed Metadata Line with typographic separators */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 my-2">
        <span>{application.location}</span>
        <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">
          ·
        </span>
        <span>{application.workplaceType}</span>
        {Boolean(formatSalaryDisplay(application.salary)) && (
          <>
            <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">
              ·
            </span>
            <span className="font-medium text-stone-700 dark:text-stone-300">
              {formatSalaryDisplay(application.salary)}
            </span>
          </>
        )}
      </div>

      {/* Monaco Frontalieri Indicator */}
      {(application.location?.toLowerCase().includes("monaco") ||
        application.location?.toLowerCase().includes("monte carlo") ||
        application.company?.toLowerCase().includes("bains de mer")) && (
        <div className="my-1.5 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 text-[10px] font-bold text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>🇲🇨 Principato di Monaco</span>
          <span className="font-normal opacity-85">🚆 TER Nizza ~22m</span>
        </div>
      )}

      {/* Required Skills summary (clean tag representation) */}
      {application.requiredSkills && application.requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 my-2.5">
          {application.requiredSkills.slice(0, 3).map((skill, idx) => (
            <span
              key={idx}
              className="text-[11px] text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/80 px-2 py-0.5 rounded font-medium"
            >
              {typeof skill === "object" ? String((skill as any)?.name || (skill as any)?.skill || "") : skill}
            </span>
          ))}
          {application.requiredSkills.length > 3 && (
            <span className="text-[11px] text-stone-400 dark:text-stone-500 px-1 py-0.5">
              +{application.requiredSkills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Upcoming Interview alert if scheduled */}
      {upcomingInterview && (
        <div className="my-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium truncate">
              {upcomingInterview.type}: {new Date(upcomingInterview.scheduledAt).toLocaleDateString([], { day: "2-digit", month: "short" })} ore {new Date(upcomingInterview.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      )}

      {/* Approaching deadline warning */}
      {isDeadlineNear && !upcomingInterview && (
        <div className="my-2 p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {t.deadlineWarning} ({application.deadline})
          </span>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div
        className="pt-2.5 mt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          {/* AI Auto-Apply Copilot quick trigger */}
          <button
            onClick={() => openAutoApplyForApp(application)}
            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded transition-colors"
            title="⚡ AI Auto-Apply Copilot: Kit Candidatura & Risposte Form"
          >
            <Zap className="w-3.5 h-3.5 fill-indigo-600/30" />
          </button>

          {/* Cover Letter studio quick trigger */}
          <button
            onClick={() => openCoverLetterForApp(application)}
            className="p-1.5 text-stone-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
            title={t.writeCoverLetter}
          >
            <FileText className="w-3.5 h-3.5" />
          </button>

          {/* Interview simulator quick trigger */}
          <button
            onClick={() => openInterviewCoachForApp(application)}
            className="p-1.5 text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
            title={t.prepareInterview}
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          {/* CV Tailor quick trigger */}
          <button
            onClick={() => {
              setSelectedApplication(application);
              setActiveTab("documents");
            }}
            className="p-1.5 text-stone-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
            title="Allinea e adatta automaticamente il CV per questa posizione"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* Live AI Verification check button */}
          <button
            onClick={handleVerifyLive}
            disabled={isVerifying}
            className={`p-1.5 rounded transition-colors ${
              application.verification?.status === "verified_active"
                ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                : "text-stone-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
            title="Verifica con l'AI che l'annuncio sia reale e ancora presente online"
          >
            {isVerifying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            ) : (
              <ShieldCheck
                className={`w-3.5 h-3.5 ${
                  application.verification?.status === "verified_active" ? "text-emerald-500 fill-emerald-500/20" : ""
                }`}
              />
            )}
          </button>

          {/* Job external link if present */}
          {application.sourceUrl && (
            <a
              href={application.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
              title="Apri annuncio originale"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Quick Advance to Next Stage Button */}
        {nextStage && (
          <button
            onClick={() => moveStage(application.id, nextStage)}
            className="flex items-center gap-1 text-[11px] font-medium text-stone-600 dark:text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title={`Avanza a ${nextStage}`}
          >
            <span>{t[`stage_${nextStage}`] || nextStage}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
