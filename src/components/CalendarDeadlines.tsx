import React from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  Download,
  CheckCircle,
  AlertCircle,
  Video,
  Mail,
  Sparkles,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export const CalendarDeadlines: React.FC = () => {
  const { applications, setSelectedApplication, setActiveModal, t } = useApp();

  // Collect applications due for follow-up (>= 7 days without reply)
  const followUpDueApps = applications.filter((app) => {
    if (app.stage === "offered" || app.stage === "rejected" || app.stage === "wishlist") return false;
    const timestamp = app.dateApplied
      ? new Date(app.dateApplied).getTime()
      : new Date(app.createdAt).getTime();
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    return days >= 7;
  });

  // Collect all interviews
  const allInterviews = applications.flatMap((app) =>
    app.interviews.map((interview) => ({
      ...interview,
      company: app.company,
      role: app.title,
      applicationId: app.id,
      application: app,
    }))
  );

  // Sort interviews by scheduled date
  const sortedInterviews = allInterviews.sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  // Collect all application deadlines
  const allDeadlines = applications
    .filter((a) => a.deadline)
    .map((a) => ({
      company: a.company,
      role: a.title,
      deadline: a.deadline!,
      stage: a.stage,
      application: a,
    }))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  // Function to export .ics calendar file
  const exportIcsCalendar = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CareerFlow AI//Calendar//IT\nCALSCALE:GREGORIAN\n";

    allInterviews.forEach((item) => {
      const startDate = new Date(item.scheduledAt);
      const endDate = new Date(startDate.getTime() + (item.durationMinutes || 45) * 60000);

      const formatIcsDate = (d: Date) =>
        d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      icsContent += "BEGIN:VEVENT\n";
      icsContent += `UID:interview-${item.id}@careerflow.ai\n`;
      icsContent += `DTSTAMP:${formatIcsDate(new Date())}\n`;
      icsContent += `DTSTART:${formatIcsDate(startDate)}\n`;
      icsContent += `DTEND:${formatIcsDate(endDate)}\n`;
      icsContent += `SUMMARY:Colloquio ${item.type} - ${item.company} (${item.role})\n`;
      icsContent += `DESCRIPTION:Round ${item.roundNumber} per la posizione di ${item.role} con ${item.interviewers || "il team"}. Note: ${item.notes || ""}\n`;
      if (item.locationOrLink) {
        icsContent += `LOCATION:${item.locationOrLink}\n`;
      }
      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "CareerFlow_Colloqui.ics";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.calendarTitle}</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Monitora date di colloquio e scadenze per non perdere nessuna opportunità
          </p>
        </div>

        <button
          onClick={exportIcsCalendar}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          title="Esporta per Google Calendar, Apple Calendar o Outlook"
        >
          <Download className="w-4 h-4" />
          <span>{t.exportCalendarIcs}</span>
        </button>
      </div>

      {/* Proactive Follow-up Due Banner */}
      {followUpDueApps.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-white to-stone-50 dark:from-indigo-950/40 dark:via-stone-900 dark:to-stone-900 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100/70 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  {followUpDueApps.length} candidature in attesa di follow-up (≥ 7 giorni)
                </span>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                  Azione consigliata
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {followUpDueApps.map((a) => a.company).slice(0, 3).join(", ")} {followUpDueApps.length > 3 ? `+ altre ${followUpDueApps.length - 3}` : ""}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (followUpDueApps[0]) setSelectedApplication(followUpDueApps[0]);
              setActiveModal("followUp");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apri Follow-up Generator AI</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Interviews Card */}
        <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-500" />
              <span>Colloqui Pianificati</span>
            </h2>
            <span className="text-xs text-stone-400">{sortedInterviews.length} eventi</span>
          </div>

          <div className="space-y-3">
            {sortedInterviews.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">
                Nessun colloquio programmato al momento.
              </p>
            ) : (
              sortedInterviews.map((item) => {
                const dateObj = new Date(item.scheduledAt);
                const isPast = dateObj.getTime() < Date.now();
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedApplication(item.application);
                      setActiveModal("details");
                    }}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all hover:border-indigo-400 ${
                      item.completed || isPast
                        ? "bg-stone-50/60 dark:bg-stone-800/30 border-stone-200 dark:border-stone-800 opacity-70"
                        : "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/50 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                          {item.company}
                        </span>
                        <span className="text-stone-400 ml-1.5">· {item.role}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-stone-600 dark:text-stone-400 text-xs my-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          {dateObj.toLocaleDateString([], {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          ore {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <span>({item.durationMinutes} min)</span>
                      {item.interviewers && <span>Con: {item.interviewers}</span>}
                    </div>

                    {item.locationOrLink && (
                      <div className="mt-2 pt-2 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                        <span className="truncate max-w-xs">{item.locationOrLink}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Application Deadlines Card */}
        <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Scadenze Invio Candidature</span>
            </h2>
            <span className="text-xs text-stone-400">{allDeadlines.length} monitorate</span>
          </div>

          <div className="space-y-3">
            {allDeadlines.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">
                Nessuna data di scadenza registrata nelle tue candidature.
              </p>
            ) : (
              allDeadlines.map((item, idx) => {
                const deadlineDate = new Date(item.deadline);
                const diffDays = Math.ceil(
                  (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                const isUrgent = diffDays >= 0 && diffDays <= 4;
                const isExpired = diffDays < 0;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedApplication(item.application);
                      setActiveModal("details");
                    }}
                    className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-xs cursor-pointer hover:border-indigo-400 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100">
                        {item.company}
                      </div>
                      <div className="text-stone-500">{item.role}</div>
                      <div className="text-[11px] text-stone-400 mt-1">
                        Scadenza: {item.deadline}
                      </div>
                    </div>

                    <div className="text-right">
                      {isExpired ? (
                        <span className="text-stone-400 font-medium">Scaduta</span>
                      ) : isUrgent ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Mancano {diffDays} gg!</span>
                        </span>
                      ) : (
                        <span className="text-stone-600 dark:text-stone-300">
                          {diffDays} {t.upcomingDays}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
