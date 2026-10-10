import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Building2,
  Brain,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  HelpCircle,
  Award,
  Lightbulb,
  CheckCircle,
  Coins,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle,
  Scale,
  ShieldAlert,
  RotateCcw,
  Newspaper,
  Share2,
  Compass,
  Globe,
  Radio,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { MockInterviewTurn } from "../types";

export const InterviewCoachModal: React.FC = () => {
  const { selectedApplication, activeModal, setActiveModal, language, userProfile, t, showToast } =
    useApp();

  const [activeTab, setActiveTab] = useState<
    "profiler" | "culture" | "simulator" | "negotiation"
  >("profiler");

  // Company Culture Profiler state
  const [profilerLoading, setProfilerLoading] = useState(false);
  const [profilerData, setProfilerData] = useState<{
    companyName: string;
    tagline: string;
    publicPresenceSummary: string;
    leadershipStyle: string;
    socialMediaSignals: { channel: string; insight: string }[];
    recentPressAndMilestones: {
      headline: string;
      dateOrContext: string;
      strategicImpact: string;
    }[];
    suggestedConversationalTopics: {
      topic: string;
      conversationStarter: string;
      whyItWorks: string;
      bestTimeToBringUp: string;
    }[];
    culturalFitTips: string[];
  } | null>(null);

  const [copiedTopicIndex, setCopiedTopicIndex] = useState<number | null>(null);

  // Prep Data state
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepData, setPrepData] = useState<{
    companyOverview: string;
    culturePillars: string[];
    topQuestions: {
      question: string;
      category: string;
      purpose: string;
      idealAnswerOutline: string;
    }[];
    questionsToAsk: string[];
  } | null>(null);

  // Salary Negotiation Insights state
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryData, setSalaryData] = useState<{
    seniorityLevel: string;
    currency: string;
    rangeMin: string;
    rangeMedian: string;
    rangeStretch: string;
    formattedRange: string;
    marketContext: string;
    totalCompBreakdown: { component: string; benchmark: string; notes: string }[];
    leveragePoints: string[];
    negotiationScripts: { scenario: string; script: string; rationale: string }[];
    redFlags: string[];
  } | null>(null);

  const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);

  // Simulator state
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [conversation, setConversation] = useState<MockInterviewTurn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [candidateInput, setCandidateInput] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);

  // Initialize Speech Recognition if available
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      setSpeechRecognitionSupported(true);
    }
  }, []);

  // Fetch Profiler Data on open
  useEffect(() => {
    if (activeModal === "interviewCoach" && selectedApplication && !profilerData) {
      loadProfilerData();
    }
  }, [activeModal, selectedApplication]);

  // Fetch Prep Data when modal opens
  useEffect(() => {
    if (activeModal === "interviewCoach" && selectedApplication && !prepData) {
      loadInterviewPrep();
    }
  }, [activeModal, selectedApplication]);

  // Lazy-load Salary Insights when switching to negotiation tab
  useEffect(() => {
    if (activeTab === "negotiation" && selectedApplication && !salaryData && !salaryLoading) {
      loadSalaryInsights();
    }
  }, [activeTab, selectedApplication]);

  if (activeModal !== "interviewCoach" || !selectedApplication) return null;

  const loadProfilerData = async () => {
    setProfilerLoading(true);
    try {
      const response = await fetch("/api/company-culture-profiler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: selectedApplication.company,
          jobTitle: selectedApplication.title,
          location: selectedApplication.location,
          sourceUrl: selectedApplication.sourceUrl,
          companyCulture: selectedApplication.companyCulture,
          lang: language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfilerData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProfilerLoading(false);
    }
  };

  const loadInterviewPrep = async () => {
    setPrepLoading(true);
    try {
      const response = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: selectedApplication.title,
          company: selectedApplication.company,
          jobDescription:
            selectedApplication.jobDescription ||
            selectedApplication.talkingPoints?.join("\n") ||
            "",
          lang: language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPrepData(data);
        if (data.topQuestions && data.topQuestions.length > 0) {
          setCurrentQuestion(data.topQuestions[0].question);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPrepLoading(false);
    }
  };

  const loadSalaryInsights = async () => {
    setSalaryLoading(true);
    try {
      const response = await fetch("/api/salary-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: selectedApplication.title,
          company: selectedApplication.company,
          location: selectedApplication.location,
          workplaceType: selectedApplication.workplaceType,
          currentSalaryListed: selectedApplication.salary,
          jobDescription:
            selectedApplication.jobDescription ||
            selectedApplication.talkingPoints?.join("\n") ||
            "",
          userProfile,
          lang: language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSalaryData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSalaryLoading(false);
    }
  };

  const copyScriptToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptIndex(index);
    setTimeout(() => setCopiedScriptIndex(null), 2500);
  };

  const copyTopicToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTopicIndex(index);
    setTimeout(() => setCopiedTopicIndex(null), 2500);
  };

  const startSimulator = () => {
    setSimulationStarted(true);
    if (!currentQuestion) {
      setCurrentQuestion(
        prepData?.topQuestions?.[0]?.question ||
          `Raccontaci di te e perché ti entusiasma l'opportunità in ${selectedApplication.company}.`
      );
    }
  };

  // Submit Answer to AI for Feedback
  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateInput.trim() || isEvaluating) return;

    const userText = candidateInput.trim();
    setCandidateInput("");
    setIsEvaluating(true);

    const userTurn: MockInterviewTurn = {
      role: "candidate",
      text: userText,
      timestamp: new Date().toISOString(),
    };

    setConversation((prev) => [...prev, userTurn]);

    try {
      const response = await fetch("/api/interview-sim-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: selectedApplication.title,
          company: selectedApplication.company,
          currentQuestion,
          candidateAnswer: userText,
          conversationHistory: conversation,
          lang: language,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const aiTurn: MockInterviewTurn = {
          role: "interviewer",
          text: result.nextQuestion || "Ottimo. Proseguiamo con la prossima domanda.",
          score: result.score,
          feedback: result.feedback,
          improvementTip: result.improvementTip,
          timestamp: new Date().toISOString(),
        };

        setConversation((prev) => [...prev, aiTurn]);
        setCurrentQuestion(aiTurn.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Toggle Voice Recording / Dictation
  const toggleRecording = () => {
    if (!speechRecognitionSupported) {
      showToast("Il tuo browser non supporta il riconoscimento vocale HTML5 Web Speech.", "warning");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === "en" ? "en-US" : language === "fr" ? "fr-FR" : "it-IT";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setCandidateInput((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>{selectedApplication.company}</span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span className="text-stone-600 dark:text-stone-400 font-normal">
                  {selectedApplication.title}
                </span>
              </h2>
              <p className="text-xs text-stone-500">{t.interviewCoachTitle}</p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab("profiler")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "profiler"
                ? "bg-white dark:bg-stone-800 text-indigo-700 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-200 dark:ring-indigo-800"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.tabProfiler}</span>
          </button>

          <button
            onClick={() => setActiveTab("culture")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "culture"
                ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t.tabCulture}</span>
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "simulator"
                ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>{t.tabSimulator}</span>
          </button>

          <button
            onClick={() => setActiveTab("negotiation")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "negotiation"
                ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.tabSalary}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* TAB 0: COMPANY CULTURE PROFILER */}
          {activeTab === "profiler" && (
            <div className="space-y-6">
              {profilerLoading ? (
                <div className="py-20 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-xs text-stone-500 font-medium">
                    {t.profilerLoading}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Esame della reputazione pubblica, canali social e notizie recenti per {selectedApplication.company}...
                  </p>
                </div>
              ) : !profilerData ? (
                <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/30 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
                  <Compass className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {t.cultureProfilerTitle}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {t.cultureProfilerDesc}
                    </p>
                  </div>
                  <button
                    onClick={loadProfilerData}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2 mx-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t.generateProfilerBtn}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Executive Header Banner */}
                  <div className="p-5 bg-gradient-to-br from-indigo-50/70 via-white to-stone-50 dark:from-indigo-950/40 dark:via-stone-900 dark:to-stone-900 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 dark:border-stone-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                            {profilerData.companyName}
                          </h3>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-100/70 dark:bg-indigo-900/70 text-indigo-800 dark:text-indigo-300 font-bold">
                            Culture Profile
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 italic mt-0.5">
                          "{profilerData.tagline}"
                        </p>
                      </div>

                      <button
                        onClick={loadProfilerData}
                        className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 self-start sm:self-center"
                        title="Rigenera analisi con AI"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Public Presence Summary */}
                    <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed space-y-2">
                      <p>{profilerData.publicPresenceSummary}</p>
                    </div>

                    {/* Core Leadership Style */}
                    <div className="pt-2 border-t border-stone-200/50 dark:border-stone-800 flex items-start gap-2 text-xs">
                      <span className="font-bold text-stone-900 dark:text-stone-100 shrink-0">
                        Stile di Leadership & Management:
                      </span>
                      <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                        {profilerData.leadershipStyle}
                      </span>
                    </div>
                  </div>

                  {/* Social Signals & Press Releases Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Social Media Signals */}
                    <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-3">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-sky-500" />
                        <span>{t.socialSignalsTitle}</span>
                      </h4>

                      <div className="space-y-2.5">
                        {profilerData.socialMediaSignals.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/70 dark:border-stone-700/70 text-xs space-y-1"
                          >
                            <span className="font-bold text-sky-700 dark:text-sky-300 block text-[11px]">
                              {item.channel}
                            </span>
                            <p className="text-stone-600 dark:text-stone-300 leading-normal">
                              {item.insight}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Press Releases & Milestones */}
                    <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-3">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-emerald-500" />
                        <span>{t.pressReleasesTitle}</span>
                      </h4>

                      <div className="space-y-2.5">
                        {profilerData.recentPressAndMilestones.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/70 dark:border-stone-700/70 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-stone-900 dark:text-stone-100 truncate">
                                {item.headline}
                              </span>
                              <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                                {item.dateOrContext}
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                              Impatto: {item.strategicImpact}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Suggested Conversational Topics & Icebreakers */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <Radio className="w-4 h-4 text-indigo-500" />
                        <span>{t.conversationalTopicsTitle}</span>
                      </h4>
                      <span className="text-[11px] text-stone-400">
                        Dimostra preparazione profonda al colloquio
                      </span>
                    </div>

                    <div className="space-y-3">
                      {profilerData.suggestedConversationalTopics.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                                {idx + 1}. {item.topic}
                              </span>
                              <span className="text-[11px] text-stone-400">
                                Momento ideale: <strong className="text-stone-600 dark:text-stone-300">{item.bestTimeToBringUp}</strong>
                              </span>
                            </div>

                            <button
                              onClick={() => copyTopicToClipboard(item.conversationStarter, idx)}
                              className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg transition-colors shrink-0"
                              title="Copia spunto per il colloquio"
                            >
                              {copiedTopicIndex === idx ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600">Copiato!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>{t.copyTopicBtn}</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Verbatim Talking Point */}
                          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border-l-4 border-indigo-500 text-xs italic text-stone-800 dark:text-stone-200 leading-relaxed font-serif">
                            "{item.conversationStarter}"
                          </div>

                          <p className="text-[11px] text-stone-500 leading-normal">
                            <span className="font-semibold text-stone-700 dark:text-stone-300">
                              Perché funziona:{" "}
                            </span>
                            {item.whyItWorks}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cultural Fit Tips */}
                  {profilerData.culturalFitTips && profilerData.culturalFitTips.length > 0 && (
                    <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl text-xs space-y-2">
                      <h4 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Consigli Pratici di Allineamento Culturale</span>
                      </h4>
                      <ul className="space-y-1.5 text-emerald-800/90 dark:text-emerald-300/90 list-disc list-inside leading-relaxed">
                        {profilerData.culturalFitTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: CULTURE & INTERVIEW GUIDE */}
          {activeTab === "culture" && (
            <>
              {prepLoading ? (
                <div className="py-20 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-xs text-stone-500">
                    L'AI sta analizzando l'azienda e preparando le domande personalizzate...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Company Culture & Values */}
                  <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
                    <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-500" />
                      <span>{t.companyValuesTitle}</span>
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {prepData?.companyOverview ||
                        selectedApplication.companyCulture ||
                        "Azienda dinamica focalizzata su innovazione, autonomia e crescita orientata ai risultati."}
                    </p>

                    {prepData?.culturePillars && prepData.culturePillars.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {prepData.culturePillars.map((p, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-white dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Top Questions & STAR Outlines */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-emerald-500" />
                      <span>{t.topQuestionsTitle}</span>
                    </h3>

                    <div className="space-y-3">
                      {prepData?.topQuestions?.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                              {idx + 1}. {item.question}
                            </span>
                            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 italic">
                            Perché lo chiedono: {item.purpose}
                          </p>
                          <div className="text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/40 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800">
                            <span className="font-semibold block text-[11px] text-stone-500 mb-0.5">
                              Struttura risposta consigliata (STAR):
                            </span>
                            {item.idealAnswerOutline}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* High Caliber Questions to Ask Recruiter */}
                  {prepData?.questionsToAsk && prepData.questionsToAsk.length > 0 && (
                    <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
                      <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>{t.questionsToAskTitle}</span>
                      </h3>
                      <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300 list-disc list-inside">
                        {prepData.questionsToAsk.map((q, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* TAB 2: INTERACTIVE MOCK SIMULATOR */}
          {activeTab === "simulator" && (
            <div className="space-y-4">
              {!simulationStarted ? (
                <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/30 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
                  <Brain className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Simulazione Colloquio per {selectedApplication.company}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {t.simulatorIntro}
                    </p>
                  </div>
                  <button
                    onClick={startSimulator}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    {t.startSimulation}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Current Active Interviewer Question */}
                  <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                      <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                        Domanda del Recruiter ({selectedApplication.company})
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {currentQuestion}
                    </p>
                  </div>

                  {/* Previous conversation turns and feedback history */}
                  {conversation.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {conversation.map((turn, i) => (
                        <div
                          key={i}
                          className={`p-3.5 rounded-xl text-xs space-y-2 ${
                            turn.role === "candidate"
                              ? "bg-stone-100 dark:bg-stone-800/70 ml-8 text-stone-800 dark:text-stone-200"
                              : "bg-white dark:bg-stone-900 mr-8 border border-stone-200 dark:border-stone-800 shadow-xs"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span>
                              {turn.role === "candidate" ? "La tua risposta" : "Feedback & Valutazione AI"}
                            </span>
                            {turn.score && (
                              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                <Award className="w-3.5 h-3.5" />
                                <span>Punteggio: {turn.score}/10</span>
                              </div>
                            )}
                          </div>

                          <p className="leading-relaxed">{turn.text}</p>

                          {turn.feedback && (
                            <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1">
                              <p className="text-stone-600 dark:text-stone-400">
                                <span className="font-semibold text-stone-800 dark:text-stone-200">
                                  Punti di forza:{" "}
                                </span>
                                {turn.feedback}
                              </p>
                              {turn.improvementTip && (
                                <p className="text-amber-700 dark:text-amber-300">
                                  <span className="font-semibold">{t.coachingTip} </span>
                                  {turn.improvementTip}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Candidate Input area with voice button */}
                  <form onSubmit={handleAnswerSubmit} className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                      {t.yourAnswer}
                    </label>

                    <div className="relative">
                      <textarea
                        rows={3}
                        value={candidateInput}
                        onChange={(e) => setCandidateInput(e.target.value)}
                        placeholder={t.yourAnswerPlaceholder}
                        className="w-full p-3 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none pr-12"
                      />

                      <button
                        type="button"
                        onClick={toggleRecording}
                        className={`absolute right-3 bottom-3 p-2 rounded-lg transition-colors ${
                          isRecording
                            ? "bg-rose-500 text-white animate-pulse"
                            : "text-stone-400 hover:text-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700"
                        }`}
                        title={isRecording ? t.stopDictation : t.startDictation}
                      >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-stone-400">
                        {isRecording ? "Ascolto vocale attivo..." : "Puoi scrivere o parlare al microfono"}
                      </span>

                      <button
                        type="submit"
                        disabled={isEvaluating || !candidateInput.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isEvaluating ? t.evaluatingAnswer : t.submitAnswer}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SALARY NEGOTIATION INSIGHTS */}
          {activeTab === "negotiation" && (
            <div className="space-y-6">
              {salaryLoading ? (
                <div className="py-20 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-xs text-stone-500 font-medium">
                    {t.analyzingSalary}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Confronto in corso per {selectedApplication.title} ({selectedApplication.location || "Mercato Tech"})
                  </p>
                </div>
              ) : !salaryData ? (
                <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/30 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
                  <Coins className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {t.salaryInsightsTitle}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {t.salaryInsightsDesc}
                    </p>
                  </div>
                  <button
                    onClick={loadSalaryInsights}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2 mx-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t.generateInsightsBtn}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Benchmark Range Card */}
                  <div className="p-5 bg-gradient-to-br from-indigo-50/80 via-white to-stone-50 dark:from-indigo-950/40 dark:via-stone-900 dark:to-stone-900 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 dark:border-stone-800 pb-3">
                      <div>
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                          {t.estimatedRange}
                        </span>
                        <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">
                          {salaryData.formattedRange}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-[11px] text-stone-400 block">
                            {t.seniorityAssessed}
                          </span>
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                            {salaryData.seniorityLevel}
                          </span>
                        </div>
                        <button
                          onClick={loadSalaryInsights}
                          className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                          title="Ricalcola benchmark con AI"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 3-Tier Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-white dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700/80">
                        <span className="text-[11px] text-stone-500 block mb-0.5">
                          {t.marketLow}
                        </span>
                        <span className="text-sm font-bold text-stone-700 dark:text-stone-300">
                          {salaryData.rangeMin}
                        </span>
                        <span className="text-[10px] text-stone-400 block mt-1">
                          Base di ingresso o profili con minor autonomia
                        </span>
                      </div>

                      <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800/80 ring-1 ring-indigo-300/40">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                            {t.targetMedian}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase">Target</span>
                        </div>
                        <span className="text-base font-extrabold text-indigo-950 dark:text-indigo-200">
                          {salaryData.rangeMedian}
                        </span>
                        <span className="text-[10px] text-indigo-700/80 dark:text-indigo-300/80 block mt-1">
                          Punto di equilibrio consigliato per il tuo livello
                        </span>
                      </div>

                      <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/80">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                            {t.stretchTop}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">Top 10%</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                          {salaryData.rangeStretch}
                        </span>
                        <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400 block mt-1">
                          Obiettivo con match elevato e competenze critiche
                        </span>
                      </div>
                    </div>

                    {/* Market Context Editorial Analysis */}
                    <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed pt-1">
                      <span className="font-semibold text-stone-900 dark:text-stone-100 block mb-1">
                        Analisi Comparativa di Mercato:
                      </span>
                      <p>{salaryData.marketContext}</p>
                    </div>
                  </div>

                  {/* Total Compensation Package Breakdown */}
                  <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-indigo-500" />
                      <span>{t.totalCompTitle}</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {salaryData.totalCompBreakdown.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/80 dark:border-stone-700/80 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 dark:text-stone-100">
                              {item.component}
                            </span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {item.benchmark}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            {item.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Leverage Points */}
                  <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-2.5">
                    <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span>{t.leveragePointsTitle}</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300 list-disc list-inside leading-relaxed">
                      {salaryData.leveragePoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Verbatim Negotiation Scripts */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-indigo-500" />
                      <span>{t.scriptsTitle}</span>
                    </h3>

                    <div className="space-y-3">
                      {salaryData.negotiationScripts.map((scriptObj, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                              Scenario {idx + 1}: {scriptObj.scenario}
                            </span>
                            <button
                              onClick={() => copyScriptToClipboard(scriptObj.script, idx)}
                              className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-lg transition-colors shrink-0"
                              title="Copia script negli appunti"
                            >
                              {copiedScriptIndex === idx ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600">Copiato!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copia Script</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border-l-4 border-indigo-500 text-xs italic text-stone-800 dark:text-stone-200 leading-relaxed font-serif">
                            "{scriptObj.script}"
                          </div>

                          <p className="text-[11px] text-stone-500 leading-normal">
                            <span className="font-semibold text-stone-700 dark:text-stone-300">
                              Razionale strategico:{" "}
                            </span>
                            {scriptObj.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Red flags */}
                  {salaryData.redFlags && salaryData.redFlags.length > 0 && (
                    <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-xs space-y-1.5">
                      <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>{t.redFlagsTitle}</span>
                      </h4>
                      <ul className="space-y-1 text-amber-800/90 dark:text-amber-300/90 list-disc list-inside">
                        {salaryData.redFlags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
