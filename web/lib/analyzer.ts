import type { RiskLevel, SentimentLabel } from "./types";

// Client-side mirror of the pipeline's rule-based logic, used only for the
// interactive single-comment demo. It approximates the Python pipeline so the
// demo runs without a backend; it is not the source of the dashboard metrics.

const SLANG: Record<string, string> = {
  ga: "tidak",
  gak: "tidak",
  nggak: "tidak",
  ngga: "tidak",
  gk: "tidak",
  tdk: "tidak",
  yg: "yang",
  bgt: "banget",
  kalo: "kalau",
  klo: "kalau",
  duit: "uang",
  gmn: "bagaimana",
  gimana: "bagaimana",
};

const POSITIVE = [
  "bagus", "baik", "setuju", "dukung", "mendukung", "bermanfaat", "manfaat",
  "membantu", "terbantu", "merata", "mantap", "alhamdulillah", "semoga",
  "sukses", "hebat", "keren", "senang", "bersyukur", "berkualitas", "sehat",
  "enak", "suka", "amanah", "salut", "apresiasi", "semangat", "peduli",
  "terbaik", "oke", "betul",
];

const NEGATIVE = [
  "takut", "basi", "busuk", "racun", "beracun", "keracunan", "tidak layak",
  "pencitraan", "korupsi", "korup", "boros", "gagal", "kacau", "komplain",
  "kecewa", "buruk", "jelek", "sakit", "mubazir", "settingan", "bohong",
  "menipu", "parah", "salah", "mending", "percuma", "ngawur", "mahal",
  "telat", "ribet", "miris", "prihatin", "kasihan", "hancur", "stop",
];

const NEUTRAL = [
  "kapan", "dimana", "bagaimana", "siapa", "apakah", "berapa", "kenapa",
  "info", "informasi", "daftar",
];

const SARCASM = [
  "katanya", "iya paling", "wkwk", "wkwkwk", "lucu", "ngakak", "halu", "drama",
];

const NEGATIONS = new Set([
  "tidak", "bukan", "jangan", "belum", "tanpa", "kurang", "ga", "gak",
]);

interface IssueDef {
  id: string;
  name: string;
  keywords: string[];
}

const ISSUES: IssueDef[] = [
  { id: "food_safety", name: "Food Safety", keywords: ["keracunan", "racun", "beracun", "higienis", "kebersihan", "dapur", "pengawasan", "muntah", "diare", "sppg"] },
  { id: "food_quality", name: "Food Quality", keywords: ["makanan", "menu", "basi", "tidak layak", "porsi", "lauk", "nasi", "sayur", "rasa", "kualitas", "enak", "ayam", "susu", "telur", "tempe", "daging", "ikan", "buah", "burger", "masak"] },
  { id: "budget_transparency", name: "Budget Transparency", keywords: ["anggaran", "dana", "uang", "pajak", "triliun", "miliar", "biaya", "korupsi", "korup", "transparan", "boros", "gaji"] },
  { id: "distribution_fairness", name: "Distribution Fairness", keywords: ["merata", "distribusi", "kebagian", "jatah", "adil", "pilih kasih"] },
  { id: "regional_access", name: "Regional Access", keywords: ["daerah", "desa", "pelosok", "terpencil", "kabupaten", "provinsi", "kampung", "akses"] },
  { id: "political_framing", name: "Political Framing", keywords: ["pencitraan", "politik", "janji", "kampanye", "presiden", "prabowo", "pemerintah", "negara", "rezim"] },
  { id: "implementation_quality", name: "Implementation Quality", keywords: ["pelaksanaan", "sistem", "antri", "telat", "terlambat", "ribet", "realisasi", "tutup", "ganti"] },
  { id: "eligibility", name: "Eligibility", keywords: ["syarat", "berhak", "kriteria", "kategori"] },
  { id: "student_benefit", name: "Student Benefit", keywords: ["anak sekolah", "sekolah", "siswa", "murid", "pendidikan", "gizi", "keluarga", "membantu", "anak"] },
  { id: "question_or_information", name: "Question or Information", keywords: ["kapan", "dimana", "bagaimana", "apakah", "berapa", "info", "daftar"] },
];

const RISK_CUES: { key: string; weight: number; terms: string[]; reason: string }[] = [
  { key: "food_safety", weight: 25, terms: ["racun", "keracunan", "beracun", "basi massal", "basi", "muntah", "diare"], reason: "food safety claim" },
  { key: "rumor", weight: 20, terms: ["katanya", "kabarnya", "denger denger", "konon"], reason: "rumor cue" },
  { key: "universal", weight: 15, terms: ["semua", "pasti", "selalu", "semuanya", "seluruh"], reason: "universal claim" },
  { key: "accusation", weight: 15, terms: ["korupsi", "settingan", "pencitraan", "dibayar", "proyek"], reason: "accusation cue" },
  { key: "urgency", weight: 10, terms: ["viral", "sebarkan", "jangan diam", "share"], reason: "urgency cue" },
  { key: "question", weight: 5, terms: ["apakah benar", "beneran", "benarkah", "masa sih"], reason: "claim-style question" },
];

const SOURCE_TERMS = ["sumber", "menurut", "berita", "link", "video", "data", "laporan"];
const SUPPORTIVE = ["semoga", "bagus", "membantu", "bermanfaat", "terima kasih", "mantap"];

export interface AnalysisResult {
  sentiment: SentimentLabel;
  confidence: number;
  issueId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  cues: string[];
}

function clean(text: string): string {
  let value = text.toLowerCase();
  value = value.replace(/https?:\/\/\S+|www\.\S+/g, " ");
  value = value.replace(/@\S+/g, " ");
  value = value.replace(/[^\w\s!?.,'-]/gu, " ");
  value = value
    .split(/\s+/)
    .map((token) => SLANG[token] ?? token)
    .join(" ");
  return value.replace(/\s+/g, " ").trim();
}

function matches(text: string, term: string): boolean {
  if (term.includes(" ")) return text.includes(term);
  return new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text);
}

function countTerms(text: string, terms: string[]): number {
  return terms.reduce((sum, term) => sum + (matches(text, term) ? 1 : 0), 0);
}

function riskLevelFor(score: number): RiskLevel {
  if (score <= 29) return "low";
  if (score <= 59) return "medium";
  if (score <= 79) return "high";
  return "needs_verification";
}

export function analyzeComment(rawText: string): AnalysisResult {
  const text = clean(rawText);

  let pos = countTerms(text, POSITIVE);
  let neg = countTerms(text, NEGATIVE);
  const neu = countTerms(text, NEUTRAL);
  const sar = countTerms(text, SARCASM);

  const tokens = text.split(" ");
  for (let i = 1; i < tokens.length; i += 1) {
    if (NEGATIONS.has(tokens[i - 1])) {
      if (POSITIVE.includes(tokens[i])) {
        pos = Math.max(pos - 1, 0);
        neg += 1;
      }
    }
  }

  let sentiment: SentimentLabel;
  if (sar >= 1 && neg >= 1) sentiment = "sarcastic_or_ambiguous";
  else if (pos === 0 && neg === 0) sentiment = "neutral";
  else if (pos > neg) sentiment = "positive";
  else if (neg > pos) sentiment = "negative";
  else sentiment = "neutral";

  const counts = [pos, neg, neu, sar].sort((a, b) => b - a);
  const top = counts[0];
  const margin = counts[0] - counts[1];
  const confidence =
    top === 0 ? 0.5 : Math.min(0.55 + 0.1 * top + 0.1 * margin, 0.95);

  let issue = ISSUES.find((def) => countTerms(text, def.keywords) > 0);
  if (!issue) {
    if (sentiment === "positive") issue = { id: "general_support", name: "General Support", keywords: [] };
    else if (sentiment === "negative") issue = { id: "general_rejection", name: "General Rejection", keywords: [] };
    else issue = { id: "other", name: "Other", keywords: [] };
  }

  let score = 0;
  const cues: string[] = [];
  let hasClaim = false;
  for (const cue of RISK_CUES) {
    const found = cue.terms.find((term) => matches(text, term));
    if (found) {
      score += cue.weight;
      cues.push(cue.key);
      if (["food_safety", "rumor", "universal", "accusation"].includes(cue.key)) {
        hasClaim = true;
      }
    }
  }
  if (hasClaim && !SOURCE_TERMS.some((term) => matches(text, term))) {
    score += 10;
  }
  if (!hasClaim && SUPPORTIVE.some((term) => matches(text, term))) {
    score -= 10;
  }
  score = Math.max(0, Math.min(100, score));

  return {
    sentiment,
    confidence: Math.round(confidence * 100) / 100,
    issueId: issue.id,
    riskScore: score,
    riskLevel: riskLevelFor(score),
    cues,
  };
}
