import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  TrendingUp,
  FileText,
  UserCheck,
  Award,
  XCircle,
  Mail,
} from "lucide-react";
import { JobApplication, ApplicationStage } from "../types";
import { useApp } from "../context/AppContext";

interface ApplicationJourneyTimelineProps {
  application: JobApplication;
  language?: string;
}

interface JourneyStep {
  id: string;
  stageKey: ApplicationStage;
  title: string;
  desc: string;
  benchmarkDays: number;
  icon: React.ComponentType<{ className?: string }>;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: "step-1",
    stageKey: "wishlist",
    title: "Preparazione",
    desc: "Bozza e adattamento CV/lettera",
    benchmarkDays: 2,
    icon: FileText,
  },
  {
    id: "step-2",
    stageKey: "applied",
    title: "Invio Candidatura",
    desc: "Inviata all'azienda",
    benchmarkDays: 7,
    icon: Send,
  },
  {
    id: "step-3",
    stageKey: "screening",
    title: "Screening HR",
    desc: "Primo contatto conoscitivo",
    benchmarkDays: 5,
    icon: UserCheck,
  },
  {
    id: "step-4",
    stageKey: "interviewing",
    title: "Colloqui Tecnici",
    desc: "Valutazione e prove tecniche",
    benchmarkDays: 10,
    icon: MessageSquare,
  },
  {
    id: "step-5",
    stageKey: "offered",
    title: "Offerta & Esito",
    desc: "Decisione finale",
    benchmarkDays: 5,
    icon: Award,
  },
];

const STAGE_ORDER_MAP: Record<ApplicationStage, number> = {
  wishlist: 0,
  applied: 1,
  screening: 2,
  interviewing: 3,
  offered: 4,
  rejected: 4,
  archived: 4,
};

export const ApplicationJourneyTimeline: React.FC<ApplicationJourneyTimelineProps> = ({
  application,
  language = "it",
}) => {
  const { setActiveModal, setSelectedApplication } = useApp();
  const [copiedFollowup, setCopiedFollowup] = useState(false);
  const [showFollowupDetails, setShowFollowupDetails] = useState(false);

  const currentStepIndex = STAGE_ORDER_MAP[application.stage] ?? 0;
  const isRejected = application.stage === "rejected";
  const isOffered = application.stage === "offered";

  // Calculate elapsed time from dateApplied or createdAt
  const appliedDateTimestamp = application.dateApplied
    ? new Date(application.dateApplied).getTime()
    : application.createdAt
    ? new Date(application.createdAt).getTime()
    : Date.now();

  const daysElapsed = Math.max(
    0,
    Math.floor((Date.now() - appliedDateTimestamp) / (1000 * 60 * 60 * 24))
  );

  // Benchmarks based on current stage
  const currentStep = JOURNEY_STEPS[currentStepIndex] || JOURNEY_STEPS[0];
  const targetBenchmarkDays = currentStep.benchmarkDays;
  const progressRatio = Math.min(100, Math.round((daysElapsed / targetBenchmarkDays) * 100));

  // Determine expectation status
  let statusBadge = {
    label: "Nei tempi medi previsti",
    color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle2,
    advice: "Il tempo trascorso è perfettamente in linea con i tempi fisiologici di revisione dei recruiter.",
  };

  if (application.stage === "applied") {
    if (daysElapsed > targetBenchmarkDays + 5) {
      statusBadge = {
        label: "Tempi oltre la media (Follow-up suggerito)",
        color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        icon: AlertCircle,
        advice: `Sono trascorsi ${daysElapsed} giorni dall'invio. Si consiglia un breve follow-up cortese su LinkedIn o via email per rinnovare l'interesse.`,
      };
    } else if (daysElapsed > targetBenchmarkDays) {
      statusBadge = {
        label: "Finestra di follow-up in apertura",
        color: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
        icon: Clock,
        advice: "Siamo al termine della finestra tipica di screening (5-7 gg lavorativi). È un buon momento per preparare un messaggio di contatto.",
      };
    }
  } else if (application.stage === "interviewing") {
    const lastInterview = application.interviews?.[application.interviews.length - 1];
    if (lastInterview?.completed) {
      statusBadge = {
        label: "In attesa di feedback post-colloquio",
        color: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
        icon: Clock,
        advice: "Tempo medio di allineamento del comitato di selezione: 3-5 giorni lavorativi dal round tecnico.",
      };
    }
  }

  // Pre-formatted Follow-up Template
  const generateFollowupMessage = () => {
    if (language === "en") {
      return `Dear Hiring Team at ${application.company},

I hope this message finds you well. I recently submitted my application for the ${application.title} position and wanted to reaffirm my strong enthusiasm for the role and your team's mission.

Given my background and alignment with the requirements, I would welcome the opportunity to discuss how I can contribute to ${application.company}.

Thank you for your time, and I look forward to hearing from you.

Best regards,
Christian Battistoni`;
    }

    if (language === "fr") {
      return `Bonjour à l'équipe de recrutement de ${application.company},

J'espère que vous allez bien. Je vous contacte suite à ma candidature pour le poste de ${application.title}. Je souhaitais vous réaffirmer mon vif intérêt pour cette opportunité et la culture de votre entreprise.

Je reste à votre entière disposition pour échanger lors d'un bref entretien.

En vous remerciant pour votre temps,
Bien cordialement,
Christian Battistoni`;
    }

    return `Gentile Team di Selezione di ${application.company},

Spero stiate bene. Desideravo ricontattarvi brevemente in merito alla mia candidatura per la posizione di ${application.title}, inviata di recente.

Confermo il mio forte entusiasmo per il vostro progetto e rimango volentieri a vostra completa disposizione per un breve colloquio conoscitivo per illustrare il contributo che posso portare al team fin da subito.

Ringraziandovi per l'attenzione e il tempo dedicato, porgo cordiali saluti.

Christian Battistoni`;
  };

  const handleCopyFollowup = () => {
    const text = generateFollowupMessage();
    navigator.clipboard.writeText(text);
    setCopiedFollowup(true);
    setTimeout(() => setCopiedFollowup(false), 2500);
  };

  return (
    <div className="p-4 bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 dark:border-stone-700/60 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
            Application Journey & Tempo di Risposta Stimato
          </h3>
        </div>

        {/* Expected Time-To-Reply Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${statusBadge.color}`}
        >
          <statusBadge.icon className="w-3.5 h-3.5 shrink-0" />
          <span>{statusBadge.label}</span>
        </div>
      </div>

      {/* Step-by-Step Interactive Progress Timeline */}
      <div className="relative py-2">
        {/* Connecting Progress Line (Desktop) */}
        <div className="hidden sm:block absolute top-1/2 left-6 right-6 -translate-y-4 h-1 bg-stone-200 dark:bg-stone-700 rounded-full z-0" />

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative z-10">
          {JOURNEY_STEPS.map((step, idx) => {
            const isCompleted = currentStepIndex > idx || (currentStepIndex === idx && (isOffered || isRejected));
            const isCurrent = currentStepIndex === idx && !isOffered && !isRejected;
            const isFuture = currentStepIndex < idx;
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isCompleted
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/70"
                    : isCurrent
                    ? "bg-white dark:bg-stone-800 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400/20 shadow-xs"
                    : "bg-stone-100/50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-indigo-600 text-white animate-pulse"
                        : "bg-stone-200 dark:bg-stone-700 text-stone-500"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-stone-400">
                    Passo {idx + 1}
                  </span>
                </div>

                <div>
                  <span
                    className={`font-bold block text-xs ${
                      isCurrent
                        ? "text-indigo-600 dark:text-indigo-400"
                        : isCompleted
                        ? "text-stone-800 dark:text-stone-200"
                        : "text-stone-500"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                    {step.desc}
                  </span>
                </div>

                {/* Sub-status label */}
                <div className="mt-2 pt-1.5 border-t border-stone-200/50 dark:border-stone-700/50 text-[10px] font-medium">
                  {isCurrent ? (
                    <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-bold">
                      <Clock className="w-3 h-3" />
                      <span>In corso ({daysElapsed} gg)</span>
                    </span>
                  ) : isCompleted ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Completato</span>
                  ) : (
                    <span className="text-stone-400">~{step.benchmarkDays} gg attesi</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Interaction Context & Time-to-Reply Insights Bar */}
      <div className="p-3.5 bg-white dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80 space-y-2 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-400 shrink-0" />
            <span className="text-stone-700 dark:text-stone-300 font-medium">
              Tempo trascorso dall'invio:{" "}
              <strong className="text-stone-900 dark:text-stone-100 font-bold">
                {daysElapsed} giorni
              </strong>{" "}
              (Target benchmark screening: ~{targetBenchmarkDays} giorni)
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowFollowupDetails(!showFollowupDetails)}
              className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:underline font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                {showFollowupDetails ? "Nascondi Anteprima" : "Bozza Rapida"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedApplication(application);
                setActiveModal("followUp");
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Follow-up Generator AI</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-700/60 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              daysElapsed > targetBenchmarkDays + 4
                ? "bg-amber-500"
                : "bg-indigo-600 dark:bg-indigo-400"
            }`}
            style={{ width: `${Math.min(100, Math.max(10, progressRatio))}%` }}
          />
        </div>

        <p className="text-[11px] text-stone-500 leading-relaxed">
          {statusBadge.advice}
        </p>
      </div>

      {/* Follow-up Assistant Expandable Box */}
      {showFollowupDetails && (
        <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Modello di Follow-up Personalizzato</span>
            </div>

            <button
              type="button"
              onClick={handleCopyFollowup}
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-stone-800 hover:bg-stone-100 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-xs transition-colors"
            >
              {copiedFollowup ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copiato negli appunti!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copia Messaggio</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3 bg-white dark:bg-stone-900/80 rounded-lg border border-stone-200/80 dark:border-stone-800 text-[11px] font-mono text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
            {generateFollowupMessage()}
          </pre>

          <p className="text-[11px] text-stone-500">
            Consiglio: invia questo messaggio direttamente al recruiter o hiring manager su LinkedIn, oppure rispondi alla mail di conferma candidatura.
          </p>
        </div>
      )}
    </div>
  );
};
