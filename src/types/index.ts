export type ApplicationStage =
  | "wishlist" // Da candidarsi
  | "applied" // Candidatura inviata
  | "screening" // Screening / Primo contatto
  | "interviewing" // Colloquio tecnico/HR
  | "offered" // Offerta ricevuta
  | "rejected" // Rifiutata
  | "archived"; // Archiviata

export type WorkplaceType = "Remote" | "Hybrid" | "On-site";

export interface InterviewRound {
  id: string;
  roundNumber: number;
  type: "HR Screening" | "Technical" | "Hiring Manager" | "Executive" | "Other";
  scheduledAt: string; // ISO date string
  durationMinutes: number;
  interviewers?: string;
  locationOrLink?: string;
  notes?: string;
  completed?: boolean;
}

export interface JobApplication {
  id: string;
  company: string;
  title: string;
  stage: ApplicationStage;
  location: string;
  workplaceType: WorkplaceType;
  salary?: string;
  sourceUrl?: string;
  sourcePlatform?: string; // LinkedIn, Indeed, RemoteOK, Welcome to the Jungle, etc.
  dateApplied?: string; // YYYY-MM-DD
  deadline?: string; // YYYY-MM-DD
  contactPerson?: string;
  contactEmail?: string;
  jobDescription?: string;
  requiredSkills: string[];
  softSkills?: string[];
  responsibilities?: string[];
  talkingPoints?: string[];
  companyCulture?: string;
  matchScore?: number; // 0 - 100
  cvMatchDetails?: CvMatchDetail;
  notes?: string;
  interviews: InterviewRound[];
  coverLetterId?: string;
  priority?: "low" | "medium" | "high";
  verification?: JobVerificationResult;
  createdAt: string;
  updatedAt: string;
}

export interface JobVerificationResult {
  isVerified: boolean;
  status: "verified_active" | "alternative_active" | "unverified_search_fallback";
  confidence: number;
  verifiedUrl: string;
  verifiedPlatform: string;
  summary: string;
  checkedAt: string;
  sourceNote?: string;
  companyCareerUrl?: string;
  googleJobsUrl?: string;
}

export interface UserProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedIn?: string;
  portfolio?: string;
  experienceSummary: string;
  skills: string[];
  targetRoles: string[];
  achievements?: string;
}

export interface CoverLetterTemplate {
  id: string;
  title: string;
  content: string;
  language: "it" | "en" | "fr";
  tags: string[];
  updatedAt: string;
}

export interface SavedDocument {
  id: string;
  name: string;
  type: "cv" | "cover_letter" | "portfolio" | "certificate" | "other";
  fileFormat?: "pdf" | "docx" | "txt" | "md" | "other";
  fileSize?: string;
  fileUrl?: string;
  content?: string;
  uploadedAt: string;
  notes?: string;
  matchedApplicationId?: string;
}

export interface ParsedDocumentResult {
  success: boolean;
  fileName: string;
  fileType: string;
  parsingMethod: string;
  markdown: string;
  rawText: string;
  wordCount: number;
  metadata?: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    github?: string;
    skills?: string[];
    summary?: string;
    experienceYears?: string;
  };
}

export interface CvTailoringResult {
  atsMatchScoreBefore: number;
  atsMatchScoreAfter: number;
  matchedKeywords: string[];
  missingKeywordsToAcquire: { skill: string; advice: string }[];
  keyModifications: {
    section: string;
    changeDescription: string;
    whyItHelps: string;
  }[];
  executiveSummaryPitch: string;
  tailoredCvMarkdown: string;
}

export interface MockInterviewTurn {
  role: "interviewer" | "candidate";
  text: string;
  score?: number;
  feedback?: string;
  improvementTip?: string;
  timestamp: string;
}

export interface CvMatchDetail {
  score: number;
  matchLevel?: string;
  strengths: string[];
  gaps: string[];
  interviewRecommendation: string;
  summary: string;
  evaluatedAt: string;
}

export interface DiscoveredJobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  workplaceType: WorkplaceType;
  portal:
    | "LinkedIn"
    | "Indeed"
    | "RemoteOK"
    | "WeWorkRemotely"
    | "Wellfound"
    | "Glassdoor"
    | "Monster"
    | "CompanyCareers"
    | "MonacoJob"
    | "MonteCarloWork"
    | "EmploiMonaco"
    | "GouvMonaco"
    | "SBM"
    | "FEDEM"
    | "Other";
  jobUrl: string;
  salary?: string;
  postedDate?: string;
  matchScore: number; // 0 - 100
  matchLevel: string; // e.g. "Eccellente", "Molto Alto", "Buono"
  matchReasoning: string;
  matchedSkills: string[];
  missingSkills?: string[];
  keyResponsibilities?: string[];
  description: string;
  isLiveGrounding?: boolean;
  groundingSources?: { title: string; url: string }[];
  companyCareerUrl?: string;
  googleJobsUrl?: string;
  isDirectCompanyCareer?: boolean;
  verifiedAt?: string;
  language?: string;
  industrySector?: string;
  companySize?: string;
  verification?: JobVerificationResult;
  preliminaryVerification?: {
    isVerified: boolean;
    httpStatus: number;
    checkedAt: string;
    verifiedSource: string;
    proofSnippet: string;
    directOfferUrl: string;
  };
  monacoFrontalierInfo?: {
    isMonaco: boolean;
    commuteNote?: string;
    targetSbmOrGov?: boolean;
    taxAdvantageNote?: string;
  };
}

export interface CvExtractedProfile {
  extractedProfile: string;
  seniorLevel: string;
  coreStack: string[];
  targetRoles: string[];
  bestSectors: string[];
}

export interface MonacoRadarSettings {
  enabled: boolean;
  sectorFocus?: "all" | "finance_banking" | "luxury_hospitality_sbm" | "yachting_shipping" | "tech_digital" | "construction_realestate" | "corporate_services" | "healthcare";
  crossBorderNiceTransport?: boolean; // Pendolarismo Treno TER Nizza-Monaco
  languageFocus?: "all" | "it_fr" | "it_fr_en"; // Valorizzazione bilingue/trilingue IT+FR+EN
  includeMonacoGovAndFedem?: boolean; // Inclusione Service de l'Emploi e FEDEM
}

export interface JobHunterPreferences {
  portals: string[];
  workplaceType: "All" | "Remote" | "Hybrid" | "On-site";
  location: string;
  seniority: "All" | "Junior" | "Mid" | "Senior" | "Lead";
  minMatchScore: number;
  roleFilter?: string;
  enableLiveSearch?: boolean;
  sourcePriority?: "all" | "portals" | "company_careers";
  languageFilter?: "any" | "it" | "en" | "bilingual" | "de" | "fr" | "es";
  minSalary?: "any" | "30k" | "40k" | "50k" | "60k" | "80k" | "100k";
  industrySector?: string;
  companySize?: "any" | "startup" | "scaleup" | "enterprise";
  publishFreshness?: "24h" | "7d" | "30d" | "any";
  resultsCount?: number;
  monacoSpecificRadar?: MonacoRadarSettings;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

export interface RecommendedCourse {
  title: string;
  provider: string; // e.g. "Coursera / DeepLearning.AI", "Udemy", "Linux Foundation", "AWS Training", "edX"
  type: "course" | "certification" | "specialization";
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedCost: string;
  url: string;
  keyTakeaway: string;
}

export interface SkillGapItem {
  skill: string;
  importance: "critical" | "high" | "moderate";
  frequencyCount: number;
  frequencyPct: number;
  category:
    | "Core Domain Skills"
    | "Tools & Methodologies"
    | "Leadership & Management"
    | "Compliance & Quality"
    | "Data & Analytics"
    | "Communication & Soft Skills"
    | "Hard Skill"
    | string;
  targetJobs: { company: string; title: string; id?: string }[];
  gapExplanation: string;
  learningEffort: "Quick Win (1-2 weeks)" | "Medium (3-5 weeks)" | "Deep Dive (6-8+ weeks)";
  recommendedCourses: RecommendedCourse[];
}

export interface UpskillingMilestone {
  phase: string;
  duration: string;
  milestone: string;
  focusSkills: string[];
}

export interface SkillGapAnalysisResult {
  overallMatchScore: number; // 0 - 100
  readinessSummary: string;
  evaluatedAt: string;
  totalWishlistJobsAnalyzed: number;
  acquiredSkills: string[];
  skillGaps: SkillGapItem[];
  quickWinsSummary: string;
  strategicLearningPath: UpskillingMilestone[];
}

export type SupportedLanguage = "it" | "en" | "fr";
