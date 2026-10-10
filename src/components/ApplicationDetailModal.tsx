import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  MapPin,
  Calendar,
  Trash2,
  FileText,
  MessageSquare,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  Zap,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  ApplicationStage,
  WorkplaceType,
  InterviewRound,
  JobApplication,
  JobVerificationResult,
} from "../types";
import { ApplicationJourneyTimeline } from "./ApplicationJourneyTimeline";
import { formatSalaryDisplay } from "../utils/salaryUtils";

export const ApplicationDetailModal: React.FC = () => {
  const {
    selectedApplication,
    setSelectedApplication,
    activeModal,
    setActiveModal,
    setActiveTab,
    updateApplication,
    deleteApplication,
    addApplication,
    openCoverLetterForApp,
    openInterviewCoachForApp,
    openAutoApplyForApp,
    documents,
    userProfile,
    t,
    showToast,
  } = useApp();

  const isEditingExisting = Boolean(selectedApplication?.id);
  const [isCalculatingAffinity, setIsCalculatingAffinity] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<JobApplication>>({
    company: "",
    title: "",
    stage: "wishlist",
    location: "Milano, Italia",
    workplaceType: "Remote",
    salary: "",
    deadline: "",
    dateApplied: "",
    sourceUrl: "",
    sourcePlatform: "LinkedIn",
    requiredSkills: [],
    softSkills: [],
    responsibilities: [],
    talkingPoints: [],
    companyCulture: "",
    notes: "",
    priority: "medium",
    interviews: [],
  });

  const [skillsInput, setSkillsInput] = useState("");
  const [newInterview, setNewInterview] = useState<Partial<InterviewRound>>({
    type: "Technical",
    scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    durationMinutes: 45,
    interviewers: "",
    locationOrLink: "",
    notes: "",
  });
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [isVerifyingLink, setIsVerifyingLink] = useState(false);

  const handleVerifyApplicationLink = async () => {
    if (!formData.title && !formData.company) return;
    setIsVerifyingLink(true);
    try {
      const res = await fetch("/api/job-hunter/verify-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          company: formData.company,
          location: formData.location,
          portal: formData.sourcePlatform || "Indeed",
          jobUrl: formData.sourceUrl,
        }),
      });
      if (!res.ok) throw new Error("Errore durante la verifica con l'AI");
      const data: JobVerificationResult = await res.json();
      setFormData((prev) => ({
        ...prev,
        sourceUrl: data.verifiedUrl || prev.sourceUrl,
        verification: data,
      }));
      if (selectedApplication?.id) {
        updateApplication(selectedApplication.id, {
          sourceUrl: data.verifiedUrl,
          verification: data,
        });
      }
      showToast(
        data.isVerified
          ? "✅ Annuncio verificato 100% reale ed attivo!"
          : `⚠️ Verifica completata: ${data.summary}`,
        data.isVerified ? "success" : "warning"
      );
    } catch {
      showToast("Impossibile verificare l'annuncio in tempo reale.", "error");
    } finally {
      setIsVerifyingLink(false);
    }
  };

  useEffect(() => {
    if (selectedApplication && selectedApplication.id) {
      setFormData(selectedApplication);
      setSkillsInput((selectedApplication.requiredSkills || []).join(", "));
    } else {
      setFormData({
        company: selectedApplication?.company || "",
        title: selectedApplication?.title || "",
        stage: selectedApplication?.stage || "wishlist",
        location: selectedApplication?.location || "Milano, Italia",
        workplaceType: selectedApplication?.workplaceType || "Remote",
        salary: selectedApplication?.salary || "",
        deadline: selectedApplication?.deadline || "",
        dateApplied: selectedApplication?.dateApplied || "",
        sourceUrl: selectedApplication?.sourceUrl || "",
        sourcePlatform: selectedApplication?.sourcePlatform || "LinkedIn",
        requiredSkills: selectedApplication?.requiredSkills || [],
        softSkills: selectedApplication?.softSkills || [],
        responsibilities: selectedApplication?.responsibilities || [],
        talkingPoints: selectedApplication?.talkingPoints || [],
        companyCulture: selectedApplication?.companyCulture || "",
        notes: selectedApplication?.notes || "",
        priority: selectedApplication?.priority || "medium",
        interviews: selectedApplication?.interviews || [],
      });
      setSkillsInput((selectedApplication?.requiredSkills || []).join(", "));
    }
  }, [selectedApplication]);

  if (activeModal !== "details") return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const skillsArray = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const dataToSave = {
      ...formData,
      requiredSkills: skillsArray,
      company: formData.company || "Azienda senza nome",
      title: formData.title || "Ruolo",
      stage: formData.stage || "wishlist",
      location: formData.location || "Remoto",
      workplaceType: formData.workplaceType || "Remote",
      interviews: formData.interviews || [],
    };

    if (isEditingExisting && selectedApplication?.id) {
      updateApplication(selectedApplication.id, dataToSave);
      showToast(`Candidatura per ${dataToSave.company} aggiornata!`, "success");
    } else {
      addApplication(dataToSave as any);
      showToast(`Nuova candidatura per ${dataToSave.company} aggiunta!`, "success");
    }

    setActiveModal(null);
  };

  const handleDelete = () => {
    if (selectedApplication?.id) {
      deleteApplication(selectedApplication.id);
      showToast("Candidatura rimossa con successo.", "info");
      setActiveModal(null);
    }
  };

  const handleAddInterviewRound = () => {
    if (!newInterview.scheduledAt) return;
    const round: InterviewRound = {
      id: `int-${Date.now()}`,
      roundNumber: (formData.interviews?.length || 0) + 1,
      type: newInterview.type || "Technical",
      scheduledAt: new Date(newInterview.scheduledAt).toISOString(),
      durationMinutes: Number(newInterview.durationMinutes) || 45,
      interviewers: newInterview.interviewers || "",
      locationOrLink: newInterview.locationOrLink || "",
      notes: newInterview.notes || "",
      completed: false,
    };

    setFormData((prev) => ({
      ...prev,
      interviews: [...(prev.interviews || []), round],
    }));
    setShowAddInterview(false);
  };

  const toggleInterviewComplete = (roundId: string) => {
    setFormData((prev) => ({
      ...prev,
      interviews: (prev.interviews || []).map((r) =>
        r.id === roundId ? { ...r, completed: !r.completed } : r
      ),
    }));
  };

  const handleCalculateAffinity = async () => {
    if (!formData.title || !formData.company) return;
    setIsCalculatingAffinity(true);
    try {
      const cvDoc = documents.find((d) => d.type === "cv" && d.content) || documents[0];
      const cvText = cvDoc?.content || userProfile.experienceSummary || (userProfile.title ? `Professionista: ${userProfile.title}` : "");

      const res = await fetch("/api/job-hunter/score-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText,
          applications: [
            {
              id: formData.id || "temp",
              company: formData.company,
              title: formData.title,
              requiredSkills: formData.requiredSkills || [],
              jobDescription: formData.jobDescription || "",
              workplaceType: formData.workplaceType,
              location: formData.location,
            },
          ],
          lang: "it",
        }),
      });

      if (!res.ok) throw new Error("Errore durante il calcolo");
      const data = await res.json();
      if (data.evaluations && data.evaluations[0]) {
        const ev = data.evaluations[0];
        setFormData((prev) => ({
          ...prev,
          matchScore: ev.matchScore,
          cvMatchDetails: {
            score: ev.matchScore,
            matchLevel: ev.matchLevel,
            strengths: ev.strengths || [],
            gaps: ev.gaps || [],
            interviewRecommendation: ev.interviewRecommendation || "",
            summary: ev.summary || "",
            evaluatedAt: new Date().toISOString(),
          },
        }));
        if (formData.id) {
          updateApplication(formData.id, {
            matchScore: ev.matchScore,
            cvMatchDetails: {
              score: ev.matchScore,
              matchLevel: ev.matchLevel,
              strengths: ev.strengths || [],
              gaps: ev.gaps || [],
              interviewRecommendation: ev.interviewRecommendation || "",
              summary: ev.summary || "",
              evaluatedAt: new Date().toISOString(),
            },
          });
        }
        showToast(`Affinità calcolata: ${ev.matchScore}% (${ev.matchLevel})`, "success");
      }
    } catch (e) {
      console.error(e);
      showToast("Errore nel calcolo dell'affinità con l'AI.", "error");
    } finally {
      setIsCalculatingAffinity(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {isEditingExisting ? t.detailsTitle : t.newApplication}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {isEditingExisting && selectedApplication && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    openAutoApplyForApp(selectedApplication);
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 flex items-center gap-1 shadow-2xs"
                  title="AI Auto-Apply Copilot: Form Solver & Kit Candidatura"
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600/30" />
                  <span>Auto-Apply Copilot</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    openCoverLetterForApp(selectedApplication);
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100 flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Cover Letter</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    openInterviewCoachForApp(selectedApplication);
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Colloquio</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setSelectedApplication(selectedApplication);
                    setActiveTab("documents");
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 rounded-lg hover:bg-purple-100 flex items-center gap-1"
                  title="Allinea automaticamente il CV a questa candidatura"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Adatta CV</span>
                </button>
              </>
            )}
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          {/* Visual Application Journey Timeline */}
          {isEditingExisting && selectedApplication && (
            <ApplicationJourneyTimeline
              application={{
                ...selectedApplication,
                ...formData,
                interviews: formData.interviews || selectedApplication.interviews || [],
              } as JobApplication}
              language={useApp().language}
            />
          )}

          {/* Company & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t.companyLabel} *
              </label>
              <input
                type="text"
                required
                value={formData.company || ""}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="es. Nome Azienda (es. Deloitte, Enel, Ferrero, Intesa...)"
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t.roleLabel} *
              </label>
              <input
                type="text"
                required
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="es. Ruolo di riferimento (es. Brand Manager, Sales Lead, Project Manager...)"
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Stage, Workplace & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t.stageLabel}
              </label>
              <select
                value={formData.stage || "wishlist"}
                onChange={(e) =>
                  setFormData({ ...formData, stage: e.target.value as ApplicationStage })
                }
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="wishlist">{t.stage_wishlist}</option>
                <option value="applied">{t.stage_applied}</option>
                <option value="screening">{t.stage_screening}</option>
                <option value="interviewing">{t.stage_interviewing}</option>
                <option value="offered">{t.stage_offered}</option>
                <option value="rejected">{t.stage_rejected}</option>
                <option value="archived">{t.stage_archived}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t.workplaceLabel}
              </label>
              <select
                value={formData.workplaceType || "Remote"}
                onChange={(e) =>
                  setFormData({ ...formData, workplaceType: e.target.value as WorkplaceType })
                }
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Remote">Remote (100% da remoto)</option>
                <option value="Hybrid">Hybrid (Ibrido)</option>
                <option value="On-site">On-site (In sede)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Priorità
              </label>
              <select
                value={formData.priority || "medium"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as "low" | "medium" | "high",
                  })
                }
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="high">{t.priorityHigh}</option>
                <option value="medium">{t.priorityMed}</option>
                <option value="low">{t.priorityLow}</option>
              </select>
            </div>
          </div>

          {/* Location, Salary, Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t.locationLabel}
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="es. Milano, Italia / Global"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t.salaryLabel}
              </label>
              <input
                type="text"
                value={formatSalaryDisplay(formData.salary)}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="es. €70.000 - €85.000"
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t.deadlineLabel}
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="date"
                  value={formData.deadline || ""}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Job Link & Source Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Link Annuncio di Lavoro
                </label>
                {formData.sourceUrl && (
                  <a
                    href={formData.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    title="Apri annuncio originale nel browser"
                  >
                    <span>Apri annuncio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="relative">
                <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="url"
                  value={formData.sourceUrl || ""}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="mt-1.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleVerifyApplicationLink}
                  disabled={isVerifyingLink}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
                >
                  {isVerifyingLink ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Verifica in corso con AI...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3 h-3 text-indigo-500" />
                      <span>Verifica presenza reale con AI</span>
                    </>
                  )}
                </button>
              </div>

              {formData.verification && (
                <div
                  className={`mt-2 p-2.5 rounded-xl text-xs border ${
                    formData.verification.status === "verified_active"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100"
                      : formData.verification.status === "alternative_active"
                      ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-100"
                      : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>
                        {formData.verification.status === "verified_active"
                          ? "Offerta 100% Reale e Attiva Online"
                          : formData.verification.status === "alternative_active"
                          ? "Azienda Confermata (Link Aggiornato)"
                          : "Annuncio Non Trovato nei Primi Risultati"}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/80 dark:bg-stone-900/80">
                      {formData.verification.confidence}% affidabilità
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {formData.verification.summary}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Piattaforma Origine
              </label>
              <input
                type="text"
                value={formData.sourcePlatform || ""}
                onChange={(e) => setFormData({ ...formData, sourcePlatform: e.target.value })}
                placeholder="LinkedIn, Indeed, RemoteOK, Welcome to the Jungle..."
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Required Competencies / Skills */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              {t.keyCompetencies} (separate da virgola)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="TypeScript, React, Node.js, Agile, PostgreSQL..."
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Strategic Talking Points (if extracted) */}
          {formData.talkingPoints && formData.talkingPoints.length > 0 && (
            <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-800">
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t.strategicTalkingPoints}</span>
              </span>
              <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-1 list-disc list-inside">
                {formData.talkingPoints.map((point, idx) => (
                  <li key={idx}>{typeof point === "object" ? String((point as any)?.point || (point as any)?.text || "") : point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* CV Affinity & Match Score Section */}
          <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 via-white to-stone-50 dark:from-indigo-950/20 dark:via-stone-900 dark:to-stone-900 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                  Affinità del Tuo CV con Questa Posizione
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCalculateAffinity}
                disabled={isCalculatingAffinity}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center gap-1 transition-colors shadow-xs"
              >
                <Zap className={`w-3 h-3 ${isCalculatingAffinity ? "animate-spin" : ""}`} />
                <span>
                  {isCalculatingAffinity
                     ? "Calcolo in corso..."
                    : formData.matchScore !== undefined
                    ? "Ricalcola con AI"
                    : "Calcola Affinità con AI"}
                </span>
              </button>
            </div>

            {formData.matchScore !== undefined ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {formData.matchScore}%
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                      <span>Compatibilità Semantica & ATS</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {formData.cvMatchDetails?.matchLevel || (formData.matchScore >= 90 ? "Eccellente" : formData.matchScore >= 80 ? "Molto Alta" : "Buona")}
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${formData.matchScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {formData.cvMatchDetails && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    {formData.cvMatchDetails.strengths?.length > 0 && (
                      <div className="bg-white/80 dark:bg-stone-800/80 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700">
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                          Punti di Forza del CV
                        </span>
                        <ul className="text-[11px] text-stone-600 dark:text-stone-300 space-y-0.5 list-disc list-inside">
                          {formData.cvMatchDetails.strengths.slice(0, 3).map((st, i) => (
                            <li key={i}>{typeof st === "object" ? String((st as any)?.text || (st as any)?.strength || "") : st}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {formData.cvMatchDetails.interviewRecommendation && (
                      <div className="bg-white/80 dark:bg-stone-800/80 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700">
                        <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 block mb-1">
                          Consiglio per il Colloquio
                        </span>
                        <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                          {typeof formData.cvMatchDetails.interviewRecommendation === "object"
                            ? JSON.stringify(formData.cvMatchDetails.interviewRecommendation)
                            : formData.cvMatchDetails.interviewRecommendation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Clicca su "Calcola Affinità con AI" per analizzare la rispondenza tra il tuo CV e i requisiti di questa posizione ({formData.company || "Azienda"}).
              </p>
            )}
          </div>

          {/* Interviews Tracking Section */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t.interviewsSection}</span>
              </h3>
              {!showAddInterview && (
                <button
                  type="button"
                  onClick={() => setShowAddInterview(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  {t.addRoundBtn}
                </button>
              )}
            </div>

            {/* List of Scheduled Interviews */}
            <div className="space-y-2 mb-3">
              {(formData.interviews || []).map((round) => (
                <div
                  key={round.id}
                  className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                    round.completed
                      ? "bg-stone-50 dark:bg-stone-800/30 border-stone-200 dark:border-stone-800 opacity-70"
                      : "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        Round {round.roundNumber}: {round.type}
                      </span>
                      <span className="text-stone-400">·</span>
                      <span className="text-stone-600 dark:text-stone-400">
                        {new Date(round.scheduledAt).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                      <span className="text-stone-400">·</span>
                      <span className="text-stone-500">{round.durationMinutes} min</span>
                    </div>
                    {round.interviewers && (
                      <p className="text-stone-600 dark:text-stone-400">
                        Intervistatori: {round.interviewers}
                      </p>
                    )}
                    {round.locationOrLink && (
                      <p className="text-indigo-600 dark:text-indigo-400 truncate max-w-sm">
                        Link: {round.locationOrLink}
                      </p>
                    )}
                    {round.notes && (
                      <p className="text-stone-500 italic mt-1">"{round.notes}"</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleInterviewComplete(round.id)}
                    className={`p-1 rounded text-xs flex items-center gap-1 shrink-0 ${
                      round.completed
                        ? "text-emerald-600 font-medium"
                        : "text-stone-400 hover:text-stone-700"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{round.completed ? "Completato" : "Segna fatto"}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Add Interview Sub-form */}
            {showAddInterview && (
              <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-3">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                  Pianifica Nuovo Round di Colloquio
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-0.5">Tipo</label>
                    <select
                      value={newInterview.type}
                      onChange={(e) =>
                        setNewInterview({ ...newInterview, type: e.target.value as any })
                      }
                      className="w-full text-xs p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg"
                    >
                      <option value="HR Screening">HR Screening</option>
                      <option value="Technical">Tecnico</option>
                      <option value="Hiring Manager">Hiring Manager</option>
                      <option value="Executive">Executive / Finale</option>
                      <option value="Other">Altro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-0.5">Data e Ora</label>
                    <input
                      type="datetime-local"
                      value={newInterview.scheduledAt}
                      onChange={(e) =>
                        setNewInterview({ ...newInterview, scheduledAt: e.target.value })
                      }
                      className="w-full text-xs p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-0.5">Durata (min)</label>
                    <input
                      type="number"
                      value={newInterview.durationMinutes}
                      onChange={(e) =>
                        setNewInterview({
                          ...newInterview,
                          durationMinutes: Number(e.target.value),
                        })
                      }
                      className="w-full text-xs p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Intervistatori (es. Luca Rossi, Lead)"
                    value={newInterview.interviewers}
                    onChange={(e) =>
                      setNewInterview({ ...newInterview, interviewers: e.target.value })
                    }
                    className="w-full text-xs p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Link Google Meet / Zoom / Indirizzo"
                    value={newInterview.locationOrLink}
                    onChange={(e) =>
                      setNewInterview({ ...newInterview, locationOrLink: e.target.value })
                    }
                    className="w-full text-xs p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddInterview(false)}
                    className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-700"
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    onClick={handleAddInterviewRound}
                    className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                  >
                    Salva Round
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              {t.notesLabel}
            </label>
            <textarea
              rows={3}
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Note sul recruiter, impressioni, promemoria..."
              className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            {isEditingExisting ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.deleteApplication}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                {t.saveChanges}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
