import React from "react";
import {
  TrendingUp,
  Target,
  Clock,
  Sparkles,
  BarChart,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { SkillGapWidget } from "./SkillGapWidget";

export const AnalyticsDashboard: React.FC = () => {
  const { applications, t } = useApp();

  const total = applications.length;
  const wishlistCount = applications.filter((a) => a.stage === "wishlist").length;
  const appliedCount = applications.filter((a) => a.stage === "applied").length;
  const screeningCount = applications.filter((a) => a.stage === "screening").length;
  const interviewCount = applications.filter((a) => a.stage === "interviewing").length;
  const offeredCount = applications.filter((a) => a.stage === "offered").length;
  const rejectedCount = applications.filter((a) => a.stage === "rejected").length;

  const totalOut = total - wishlistCount;
  const respondedCount = screeningCount + interviewCount + offeredCount + rejectedCount;
  const responseRate = totalOut > 0 ? Math.round((respondedCount / totalOut) * 100) : 0;
  const interviewRate = totalOut > 0 ? Math.round(((interviewCount + offeredCount) / totalOut) * 100) : 0;
  const offerRate = totalOut > 0 ? Math.round((offeredCount / totalOut) * 100) : 0;

  // Skills aggregation
  const skillCounts: Record<string, number> = {};
  applications.forEach((app) => {
    (app.requiredSkills || []).forEach((skill) => {
      const clean = skill.trim();
      skillCounts[clean] = (skillCounts[clean] || 0) + 1;
    });
  });

  const sortedSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Workplace breakdown
  const remoteCount = applications.filter((a) => a.workplaceType === "Remote").length;
  const hybridCount = applications.filter((a) => a.workplaceType === "Hybrid").length;
  const onsiteCount = applications.filter((a) => a.workplaceType === "On-site").length;

  // Funnel steps
  const funnelSteps = [
    { label: "1. Da Candidarsi", count: wishlistCount, color: "bg-stone-300 dark:bg-stone-700" },
    { label: "2. Inviata", count: appliedCount, color: "bg-blue-400 dark:bg-blue-600" },
    { label: "3. Screening HR", count: screeningCount, color: "bg-purple-400 dark:bg-purple-600" },
    { label: "4. Colloquio Tecnico", count: interviewCount, color: "bg-amber-400 dark:bg-amber-600" },
    { label: "5. Offerta Ricevuta", count: offeredCount, color: "bg-emerald-500 dark:bg-emerald-500" },
  ];

  const maxFunnelVal = Math.max(...funnelSteps.map((s) => s.count), 1);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <BarChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>{t.analyticsTitle}</span>
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          Monitora la conversione dei tuoi invii, tempi di risposta e le competenze più richieste
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Apps */}
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-medium">{t.totalApplications}</span>
            <Layers className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{total}</div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            <span>{totalOut} inviate</span> · <span>{wishlistCount} in preparazione</span>
          </div>
        </div>

        {/* Response Rate */}
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-medium">{t.responseRate}</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {responseRate}%
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            <span>{respondedCount} risposte su {totalOut} invii</span>
          </div>
        </div>

        {/* Interview Rate */}
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-medium">Conversione a Colloquio</span>
            <Target className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {interviewRate}%
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            <span>{interviewCount + offeredCount} avanzati al colloquio</span>
          </div>
        </div>

        {/* Offer Rate */}
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-medium">{t.offerRate}</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {offerRate}%
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            <span>{offeredCount} offerte contrattuali</span>
          </div>
        </div>
      </div>

      {/* Conversion Funnel Visualization */}
      <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>{t.funnelTitle}</span>
          </h2>
          <span className="text-xs text-stone-500">Pipeline candidature attive</span>
        </div>

        <div className="space-y-3">
          {funnelSteps.map((step, idx) => {
            const widthPct = Math.max(12, Math.round((step.count / maxFunnelVal) * 100));
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    {step.label}
                  </span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {step.count} ({total > 0 ? Math.round((step.count / total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-stone-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${step.color} rounded-full transition-all duration-500`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Skill Gap Analysis Dashboard Widget (Wishlist vs CV) */}
      <SkillGapWidget />

      {/* Two columns: Top Skills in Demand & Workplace Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top In-Demand Skills */}
        <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>{t.skillsInDemandTitle}</span>
            </h2>
            <span className="text-xs text-stone-400">Estratte con AI</span>
          </div>

          <div className="space-y-2.5">
            {sortedSkills.length === 0 ? (
              <p className="text-xs text-stone-400">Nessuna competenza registrata ancora.</p>
            ) : (
              sortedSkills.map(([skill, count], idx) => {
                const maxCount = sortedSkills[0]?.[1] || 1;
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-stone-700 dark:text-stone-300">
                        {skill}
                      </span>
                      <span className="text-stone-500 text-[11px]">
                        richiesto in {count} offerte
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Workplace Type Distribution */}
        <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Distribuzione Modalità di Lavoro</span>
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-center border border-stone-100 dark:border-stone-800">
              <span className="text-xs text-stone-500 block mb-1">Da Remoto</span>
              <span className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {remoteCount}
              </span>
              <span className="text-[11px] text-stone-400 block mt-0.5">
                {total > 0 ? Math.round((remoteCount / total) * 100) : 0}%
              </span>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-center border border-stone-100 dark:border-stone-800">
              <span className="text-xs text-stone-500 block mb-1">Ibrido</span>
              <span className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {hybridCount}
              </span>
              <span className="text-[11px] text-stone-400 block mt-0.5">
                {total > 0 ? Math.round((hybridCount / total) * 100) : 0}%
              </span>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-center border border-stone-100 dark:border-stone-800">
              <span className="text-xs text-stone-500 block mb-1">In Sede</span>
              <span className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {onsiteCount}
              </span>
              <span className="text-[11px] text-stone-400 block mt-0.5">
                {total > 0 ? Math.round((onsiteCount / total) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300">
            <span className="font-semibold block mb-1">Consiglio Strategico AI:</span>
            Il tuo profilo riceve il maggior tasso di contatto sulle offerte Remote e Ibrido con focus su TypeScript e React. Considera di candidarti nelle prime 48 ore dalla pubblicazione per massimizzare il tasso di screening.
          </div>
        </div>
      </div>
    </div>
  );
};
