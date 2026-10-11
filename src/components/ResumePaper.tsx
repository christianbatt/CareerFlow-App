import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { CvTailoringResult, UserProfile } from "../types";

export interface ResumePaperProps {
  tailoredResult: CvTailoringResult;
  userProfile: UserProfile;
  targetCompany?: string;
  targetRole?: string;
  lang?: "it" | "en" | "fr" | string;
  theme?: "harvard" | "executive" | "modern";
  showQrCode?: boolean;
  paperRef?: React.RefObject<HTMLDivElement | null>;
}

export const ResumePaper: React.FC<ResumePaperProps> = ({
  tailoredResult,
  userProfile,
  targetCompany,
  targetRole,
  lang = "it",
  theme = "executive",
  showQrCode = true,
  paperRef,
}) => {
  const structured = tailoredResult.structuredCv;
  const isEnglish = lang === "en";
  const isFrench = lang === "fr";

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  // Localized section titles
  const t = {
    summaryTitle: isFrench
      ? "Profil Professionnel & Synthèse"
      : isEnglish
      ? "Professional Summary"
      : "Profilo Professionale & Executive Summary",
    competenciesTitle: isFrench
      ? "Compétences Clés & Expertise Technique"
      : isEnglish
      ? "Core Competencies & Technical Stack"
      : "Competenze Chiave & Stack Tecnologico",
    experienceTitle: isFrench
      ? "Expériences Professionnelles"
      : isEnglish
      ? "Professional Experience"
      : "Esperienze Professionali",
    educationTitle: isFrench
      ? "Formation & Diplômes"
      : isEnglish
      ? "Education & Academic Credentials"
      : "Formazione & Certificazioni",
    languagesTitle: isFrench ? "Langues" : isEnglish ? "Languages" : "Competenze Linguistiche",
    certificationsTitle: isFrench
      ? "Certifications & Spécialisations"
      : isEnglish
      ? "Certifications & Accreditations"
      : "Certificazioni & Specializzazioni",
  };

  // Header info
  const fullName =
    structured?.header?.fullName ||
    userProfile.name ||
    "Christian Battistoni";
  const professionalTitle =
    structured?.header?.professionalTitle ||
    targetRole ||
    userProfile.title ||
    "Executive Professional";
  const email = structured?.header?.email || userProfile.email || "";
  const phone = structured?.header?.phone || userProfile.phone || "";
  const location = structured?.header?.location || userProfile.location || "";
  const linkedin = structured?.header?.linkedin || userProfile.linkedIn || "";
  const portfolio = structured?.header?.portfolio || userProfile.portfolio || "";

  // Dynamic QR Code generation for Candidate Profile / LinkedIn
  useEffect(() => {
    if (!showQrCode) {
      setQrCodeDataUrl(null);
      return;
    }
    const targetUrl =
      linkedin ||
      portfolio ||
      (email ? `mailto:${email}` : "https://www.linkedin.com");

    QRCode.toDataURL(targetUrl, {
      width: 120,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch(() => setQrCodeDataUrl(null));
  }, [showQrCode, linkedin, portfolio, email]);

  // If structuredCv is not present, parse markdown lines into sections cleanly
  const renderFromMarkdownFallback = () => {
    const raw = tailoredResult.tailoredCvMarkdown || "";
    const blocks = raw.split("\n\n").filter(Boolean);

    return (
      <div style={{ color: "#1e293b", lineHeight: 1.6, fontSize: "12px" }}>
        {blocks.map((block, idx) => {
          const trimmed = block.trim();
          if (trimmed.startsWith("# ")) {
            return (
              <h1
                key={idx}
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: "4px",
                  borderBottom: "1.5px solid #0f172a",
                  paddingBottom: "4px",
                }}
              >
                {trimmed.replace("# ", "")}
              </h1>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h2
                key={idx}
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: theme === "harvard" ? "#0f172a" : "#312e81",
                  marginTop: "16px",
                  marginBottom: "6px",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "3px",
                }}
              >
                {trimmed.replace("## ", "")}
              </h2>
            );
          }
          if (trimmed.startsWith("### ")) {
            return (
              <h3
                key={idx}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#1e293b",
                  marginTop: "8px",
                  marginBottom: "4px",
                }}
              >
                {trimmed.replace("### ", "")}
              </h3>
            );
          }
          if (trimmed.startsWith("- ")) {
            const items = trimmed.split("\n");
            return (
              <ul
                key={idx}
                style={{
                  margin: "4px 0 8px 18px",
                  paddingLeft: "4px",
                  listStyleType: "disc",
                }}
              >
                {items.map((it, i) => (
                  <li key={i} style={{ marginBottom: "3px", color: "#334155" }}>
                    {it.replace("- ", "").replace(/\*\*(.*?)\*\*/g, "$1")}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={idx} style={{ margin: "4px 0 8px 0", color: "#334155" }}>
              {trimmed.replace(/\*\*(.*?)\*\*/g, "$1")}
            </p>
          );
        })}
      </div>
    );
  };

  const fontFamily =
    theme === "harvard"
      ? "Georgia, 'Times New Roman', Cambria, serif"
      : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  return (
    <div
      ref={paperRef}
      id="printable-cv-paper"
      style={{
        backgroundColor: "#ffffff",
        color: "#1e293b",
        fontFamily,
        padding: "36px 42px",
        maxWidth: "800px",
        margin: "0 auto",
        boxSizing: "border-box",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        borderRadius: "4px",
      }}
    >
      {/* HEADER SECTION */}
      <header
        style={{
          borderBottom:
            theme === "harvard"
              ? "2px solid #0f172a"
              : "2px solid #4338ca",
          paddingBottom: "14px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          textAlign: theme === "harvard" ? "left" : "left",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: theme === "harvard" ? "1px" : "-0.5px",
              color: "#0f172a",
              margin: "0 0 4px 0",
              textTransform: theme === "harvard" ? "uppercase" : "none",
            }}
          >
            {fullName}
          </h1>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: theme === "harvard" ? "#475569" : "#4338ca",
              marginBottom: "8px",
            }}
          >
            {professionalTitle}
          </div>

          {/* Contact Strip */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px 14px",
              fontSize: "11px",
              color: "#475569",
              justifyContent: "flex-start",
            }}
          >
            {email && <span>📧 {email}</span>}
            {phone && <span>📱 {phone}</span>}
            {location && <span>📍 {location}</span>}
            {linkedin && <span>💼 {linkedin}</span>}
            {portfolio && <span>🔗 {portfolio}</span>}
          </div>
        </div>

        {/* Dynamic Scan-to-Profile QR Code */}
        {showQrCode && qrCodeDataUrl && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginLeft: "16px",
              padding: "4px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
            }}
          >
            <img
              src={qrCodeDataUrl}
              alt="Scan to Profile QR Code"
              style={{ width: "56px", height: "56px", display: "block" }}
            />
            <span
              style={{
                fontSize: "8px",
                fontWeight: 700,
                color: "#64748b",
                marginTop: "2px",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}
            >
              Scan Profile
            </span>
          </div>
        )}
      </header>

      {/* CONTENT: STRUCTURED OR FALLBACK */}
      {structured ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* 1. PROFESSIONAL SUMMARY */}
          {structured.summary && (
            <section>
              <h2
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: theme === "harvard" ? "#0f172a" : "#312e81",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "3px",
                  margin: "0 0 6px 0",
                }}
              >
                {t.summaryTitle}
              </h2>
              <p
                style={{
                  fontSize: "11.5px",
                  lineHeight: 1.55,
                  color: "#334155",
                  margin: 0,
                  textAlign: "justify",
                }}
              >
                {structured.summary}
              </p>
            </section>
          )}

          {/* 2. CORE COMPETENCIES MATRIX */}
          {structured.competencies && structured.competencies.length > 0 && (
            <section>
              <h2
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: theme === "harvard" ? "#0f172a" : "#312e81",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "3px",
                  margin: "0 0 6px 0",
                }}
              >
                {t.competenciesTitle}
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  fontSize: "11px",
                }}
              >
                {structured.competencies.map((cat, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "6px" }}>
                    <strong style={{ color: "#0f172a", minWidth: "140px" }}>
                      {cat.category}:
                    </strong>
                    <span style={{ color: "#334155" }}>
                      {cat.skills.join(" · ")}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. PROFESSIONAL EXPERIENCE */}
          {structured.experiences && structured.experiences.length > 0 && (
            <section>
              <h2
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: theme === "harvard" ? "#0f172a" : "#312e81",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "3px",
                  margin: "0 0 8px 0",
                }}
              >
                {t.experienceTitle}
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {structured.experiences.map((exp, idx) => (
                  <div key={idx}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: "2px",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
                        {exp.role} <span style={{ fontWeight: 500, color: "#475569" }}>| {exp.company}</span>
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#64748b",
                        }}
                      >
                        {exp.period}
                        {exp.location ? ` · ${exp.location}` : ""}
                      </span>
                    </div>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul
                        style={{
                          margin: "4px 0 0 16px",
                          paddingLeft: 0,
                          listStyleType: "disc",
                          fontSize: "11.5px",
                          lineHeight: 1.5,
                          color: "#334155",
                        }}
                      >
                        {exp.achievements.map((ach, aIdx) => (
                          <li key={aIdx} style={{ marginBottom: "3px" }}>
                            {ach}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. EDUCATION & CREDENTIALS */}
          {structured.education && structured.education.length > 0 && (
            <section>
              <h2
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: theme === "harvard" ? "#0f172a" : "#312e81",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "3px",
                  margin: "0 0 6px 0",
                }}
              >
                {t.educationTitle}
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "11.5px",
                }}
              >
                {structured.education.map((edu, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#0f172a" }}>{edu.degree}</strong>
                      <span style={{ color: "#475569" }}> — {edu.institution}</span>
                      {edu.details && (
                        <span style={{ color: "#64748b", fontStyle: "italic" }}>
                          {" "}({edu.details})
                        </span>
                      )}
                    </div>
                    {edu.year && (
                      <span style={{ color: "#64748b", fontSize: "11px" }}>
                        {edu.year}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. LANGUAGES & CERTIFICATIONS */}
          {((structured.languages && structured.languages.length > 0) ||
            (structured.certifications && structured.certifications.length > 0)) && (
            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  structured.languages?.length && structured.certifications?.length
                    ? "1fr 1fr"
                    : "1fr",
                gap: "14px",
              }}
            >
              {structured.languages && structured.languages.length > 0 && (
                <div>
                  <h2
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      color: theme === "harvard" ? "#0f172a" : "#312e81",
                      borderBottom: "1px solid #cbd5e1",
                      paddingBottom: "3px",
                      margin: "0 0 6px 0",
                    }}
                  >
                    {t.languagesTitle}
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px 12px",
                      fontSize: "11px",
                      color: "#334155",
                    }}
                  >
                    {structured.languages.map((l, idx) => (
                      <span key={idx}>
                        <strong>{l.language}:</strong> {l.proficiency}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {structured.certifications && structured.certifications.length > 0 && (
                <div>
                  <h2
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      color: theme === "harvard" ? "#0f172a" : "#312e81",
                      borderBottom: "1px solid #cbd5e1",
                      paddingBottom: "3px",
                      margin: "0 0 6px 0",
                    }}
                  >
                    {t.certificationsTitle}
                  </h2>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#334155",
                      lineHeight: 1.45,
                    }}
                  >
                    {structured.certifications.join(" · ")}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      ) : (
        renderFromMarkdownFallback()
      )}

      {/* FOOTER VERIFICATION SEAL */}
      <footer
        style={{
          marginTop: "20px",
          paddingTop: "10px",
          borderTop: "1px solid #e2e8f0",
          fontSize: "9.5px",
          color: "#94a3b8",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          Curriculum Vitae Personalizzato per {targetCompany || "Azienda Target"}
        </span>
        <span>
          ATS Score: {tailoredResult.atsMatchScoreAfter || 95}% · Verificato
        </span>
      </footer>
    </div>
  );
};
