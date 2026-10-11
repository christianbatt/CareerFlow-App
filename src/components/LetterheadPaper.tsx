import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { UserProfile } from "../types";

export interface LetterheadPaperProps {
  content: string;
  userProfile: UserProfile;
  company?: string;
  role?: string;
  subjectLine?: string;
  lang?: "it" | "en" | "fr" | string;
  showQrCode?: boolean;
  paperRef?: React.RefObject<HTMLDivElement | null>;
}

export const LetterheadPaper: React.FC<LetterheadPaperProps> = ({
  content,
  userProfile,
  company = "Azienda Target",
  role = "Ruolo di Riferimento",
  subjectLine,
  lang = "it",
  showQrCode = true,
  paperRef,
}) => {
  const isEnglish = lang === "en";
  const isFrench = lang === "fr";

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!showQrCode) {
      setQrCodeDataUrl(null);
      return;
    }
    const targetUrl =
      userProfile.linkedIn ||
      userProfile.portfolio ||
      (userProfile.email ? `mailto:${userProfile.email}` : "https://www.linkedin.com");

    QRCode.toDataURL(targetUrl, {
      width: 120,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch(() => setQrCodeDataUrl(null));
  }, [showQrCode, userProfile.linkedIn, userProfile.portfolio, userProfile.email]);

  const today = new Date();
  const formattedDate = today.toLocaleDateString(
    isFrench ? "fr-FR" : isEnglish ? "en-US" : "it-IT",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const recipientLabel = isFrench
    ? `À l'attention du Responsable du Recrutement`
    : isEnglish
    ? `To the Hiring Team & Talent Acquisition`
    : `Alla cortese attenzione del Team di Selezione`;

  const defaultSubject = isFrench
    ? `Candidature pour le poste de ${role} — ${userProfile.name || "Candidat"}`
    : isEnglish
    ? `Application for the position of ${role} — ${userProfile.name || "Candidate"}`
    : `Candidatura per la posizione di ${role} — ${userProfile.name || "Candidato"}`;

  // Filter out headers from markdown if they exist so we don't duplicate them in the letterhead
  const cleanBodyLines = content
    .replace(/^#\s+.*$/gm, "")
    .replace(/^(📧|📱|📍).*$/gm, "")
    .trim();

  const paragraphs = cleanBodyLines.split("\n\n").filter(Boolean);

  return (
    <div
      ref={paperRef}
      id="printable-letterhead-paper"
      style={{
        backgroundColor: "#ffffff",
        color: "#1e293b",
        fontFamily: "Georgia, 'Times New Roman', Cambria, serif",
        padding: "42px 48px",
        maxWidth: "800px",
        margin: "0 auto",
        boxSizing: "border-box",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        borderRadius: "4px",
        lineHeight: 1.65,
        fontSize: "12.5px",
      }}
    >
      {/* SENDER LETTERHEAD HEADER */}
      <header
        style={{
          borderBottom: "1.5px solid #0f172a",
          paddingBottom: "14px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 800,
              letterSpacing: "0.5px",
              color: "#0f172a",
              margin: "0 0 3px 0",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {userProfile.name || "Christian Battistoni"}
          </h1>
          <div
            style={{
              fontSize: "12px",
              color: "#4338ca",
              fontWeight: 600,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {role || userProfile.title || "Executive Professional"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "10.5px",
              color: "#64748b",
              textAlign: "right",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              lineHeight: 1.4,
            }}
          >
            {userProfile.email && <div>{userProfile.email}</div>}
            {userProfile.phone && <div>{userProfile.phone}</div>}
            {userProfile.location && <div>{userProfile.location}</div>}
          </div>

          {showQrCode && qrCodeDataUrl && (
            <div
              style={{
                padding: "3px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                textAlign: "center",
              }}
            >
              <img
                src={qrCodeDataUrl}
                alt="Profile QR Code"
                style={{ width: "46px", height: "46px", display: "block" }}
              />
            </div>
          )}
        </div>
      </header>

      {/* METADATA: DATE & RECIPIENT */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          fontSize: "12px",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, color: "#0f172a" }}>{recipientLabel}</div>
          <div style={{ color: "#334155", fontWeight: 600 }}>{company}</div>
          <div style={{ color: "#64748b", fontSize: "11px" }}>Ufficio Risorse Umane & Selezione</div>
        </div>
        <div style={{ color: "#475569", fontWeight: 500 }}>
          {formattedDate}
        </div>
      </div>

      {/* SUBJECT LINE */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          borderLeft: "3px solid #4338ca",
          padding: "8px 12px",
          marginBottom: "20px",
          fontSize: "12px",
          fontWeight: 700,
          color: "#0f172a",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <span style={{ color: "#64748b", fontWeight: 600, marginRight: "4px" }}>
          {isFrench ? "Objet :" : isEnglish ? "Subject:" : "Oggetto:"}
        </span>
        {subjectLine || defaultSubject}
      </div>

      {/* BODY PARAGRAPHS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", color: "#334155" }}>
        {paragraphs.map((p, idx) => {
          const trimmed = p.trim();
          if (trimmed.startsWith("- ")) {
            const items = trimmed.split("\n");
            return (
              <ul
                key={idx}
                style={{
                  margin: "4px 0 6px 18px",
                  paddingLeft: "4px",
                  listStyleType: "disc",
                }}
              >
                {items.map((it, i) => (
                  <li key={i} style={{ marginBottom: "4px" }}>
                    {it.replace("- ", "").replace(/\*\*(.*?)\*\*/g, "$1")}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p
              key={idx}
              style={{
                margin: 0,
                textAlign: "justify",
                lineHeight: 1.65,
              }}
            >
              {trimmed.replace(/\*\*(.*?)\*\*/g, "$1")}
            </p>
          );
        })}
      </div>

      {/* SIGN OFF */}
      <div style={{ marginTop: "28px" }}>
        <div style={{ color: "#334155", marginBottom: "16px" }}>
          {isFrench
            ? "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées."
            : isEnglish
            ? "Sincerely,"
            : "Cordiali saluti,"}
        </div>
        <div
          style={{
            fontWeight: 800,
            fontSize: "14px",
            color: "#0f172a",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {userProfile.name || "Christian Battistoni"}
        </div>
      </div>
    </div>
  );
};
