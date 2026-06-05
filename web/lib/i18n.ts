import type {
  Locale,
  LocalizedString,
  RiskLevel,
  SentimentLabel,
} from "./types";

export const LOCALES: Locale[] = ["en", "id"];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string | undefined): value is Locale {
  return value === "id" || value === "en";
}

export function localize(
  value: LocalizedString | string | undefined,
  locale: Locale,
): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[locale] ?? value.en ?? "";
}

const en = {
  nav: {
    home: { label: "Home", description: "Project overview" },
    dashboard: { label: "Dashboard", description: "Executive overview" },
    sentiment: { label: "Sentiment", description: "Sentiment analysis" },
    issues: { label: "Issues", description: "Public concerns" },
    risk: { label: "Risk Signals", description: "Comments to review" },
  },
  common: {
    exploreDashboard: "Explore the dashboard",
    openDashboard: "Open the dashboard",
    viewGithub: "View on GitHub",
    copySummary: "Copy summary",
    copied: "Copied",
    viewOnKaggle: "View the dataset on Kaggle",
    page: "Page",
    of: "of",
    prev: "Prev",
    next: "Next",
    language: "Language",
  },
  sidebar: { dataLabel: "Data: TikTok comments on MBG.", kaggleDataset: "Kaggle dataset" },
  footer: {
    tagline: "VoxPop MBG — public opinion intelligence from TikTok comments about MBG.",
    dataSource: "Data source:",
    by: "by",
    disclaimer:
      "Risk signals are indicators for manual review and do not determine whether a comment is true or false.",
  },
  home: {
    badge: "NLP analytics for public opinion",
    tagline:
      "Public opinion intelligence from TikTok comments about MBG (Makan Bergizi Gratis).",
    subtitle:
      "A full-stack NLP dashboard that analyzes sentiment, public issues, risk signals, and stakeholder recommendations from social media comments.",
    statComments: "Comments analyzed",
    statIssues: "Issue categories",
    statFlagged: "Comments flagged for review",
    problemEyebrow: "The problem",
    problemTitle: "A sentiment chart alone does not explain public concern.",
    problemBody:
      "Conversations about MBG on TikTok are large, informal, and noisy. Knowing whether comments are positive or negative does not reveal what people care about, which issues are escalating, or which narratives need verification. VoxPop MBG turns unstructured comments into structured answers.",
    questions: [
      "What is the overall public sentiment toward MBG?",
      "Which issues are people discussing most often?",
      "Which issues are associated with negative sentiment?",
      "Which comments contain rumor or claim patterns to review?",
      "What communication actions should stakeholders prioritize?",
    ],
    featuresTitle: "What the dashboard covers",
    featuresSubtitle: "Four analysis layers, each with its own page and supporting detail.",
    features: [
      {
        title: "Sentiment Analysis",
        description:
          "Classifies Indonesian comments into positive, negative, neutral, and sarcastic or ambiguous signals.",
      },
      {
        title: "Issue Detection",
        description:
          "Maps comments to public issue categories such as food quality, budget transparency, and distribution fairness.",
      },
      {
        title: "Risk Signal Monitoring",
        description:
          "Highlights comments with rumor or claim patterns that may require manual verification.",
      },
      {
        title: "Recommendation Summary",
        description:
          "Distills aggregated analysis into a concise executive summary on the dashboard.",
      },
    ],
    ctaTitle: "See the analysis in action",
    ctaSubtitle: "Explore the executive overview, then dig into sentiment, issues, and risk signals.",
  },
  dashboard: {
    eyebrow: "Executive overview",
    title: "Dashboard",
    description: "Analysis of {count} TikTok comments about MBG{range}.",
    metricTotal: "Total comments",
    metricTotalSub: "Distinct comments in the dataset",
    metricUsable: "Usable comments",
    metricUsableSub: "After cleaning and deduplication",
    metricRemoved: "Removed",
    metricRemovedSub: "{empty} empty · {dup} duplicate",
    metricFlagged: "Flagged for review",
    metricFlaggedSub: "{pct} of usable comments",
    sentimentDistribution: "Sentiment distribution",
    topIssues: "Top issues",
    riskSignals: "Risk signals",
    flagged: "Flagged",
    highRisk: "High risk",
    avgScore: "Avg score",
    representative: "Representative comments",
    methodologyNote:
      "Metrics are computed from precomputed JSON exported by the pipeline. Sentiment uses weak labeling; risk scoring is rule-based and indicates comments for manual review.",
    method: "Method",
    avgConfidence: "Average confidence",
  },
  sentiment: {
    eyebrow: "Sentiment analysis",
    title: "Sentiment",
    description:
      "How positive, negative, neutral, and ambiguous comments are distributed, with confidence and trend detail.",
    distribution: "Distribution",
    modelMetrics: "Model metrics",
    metricMethod: "Method",
    metricLabelSource: "Label source",
    metricAccuracy: "Accuracy",
    metricMacroF1: "Macro F1",
    metricPrecision: "Precision (macro)",
    metricRecall: "Recall (macro)",
    metricNote:
      "Metrics describe cross-validated agreement with weak labels, not human-reviewed accuracy.",
    notEvaluated: "Not evaluated",
    overTime: "Sentiment over time",
    overTimeSub: "Weekly comment volume by sentiment.",
    confidence: "Average confidence by class",
    confidenceSub: "Mean predicted probability per sentiment class.",
    explorer: "Comment explorer",
    explorerSub:
      "Filter the sanitized sample by sentiment, issue, risk, and confidence. Usernames are never shown.",
  },
  issues: {
    eyebrow: "Issue detection",
    title: "Public issues",
    description:
      "What people are discussing, how often, and how negative each topic is. Issue categories come from a curated keyword taxonomy.",
    topByVolume: "Top issues by volume",
    topByVolumeSub: "Bar color reflects how negative each issue is.",
    sentimentByIssue: "Sentiment by issue",
    sentimentByIssueSub: "Sentiment composition within each issue.",
    detail: "Issue detail",
    detailSub: "Severity combines volume, negativity, and model confidence.",
    allCategories: "All categories",
    allCategoriesSub:
      "Full breakdown including general support, rejection, and uncategorized comments.",
    severity: "Severity",
    commentsWithShare: "{count} comments ({share})",
    negativeShare: "{share} negative",
  },
  risk: {
    eyebrow: "Risk signals",
    title: "Comments to review",
    description:
      "Comments with rumor or claim patterns that may warrant manual verification. This is a review aid, not a truth judgment.",
    flaggedComments: "Flagged comments",
    flaggedCommentsSub: "Medium risk and above",
    highRisk: "High risk",
    highRiskSub: "Score 60–79",
    needsVerification: "Needs verification",
    needsVerificationSub: "Score 80–100",
    avgFlagged: "Avg flagged score",
    avgFlaggedSub: "Across flagged comments",
    distribution: "Risk distribution",
    distributionSub: "Most comments are low risk; flagged comments are a small share.",
    narratives: "Top risk narratives",
    narrativesSub: "Grouped by the dominant cue in each flagged comment.",
    noNarratives: "No risk narratives identified",
    explorer: "Flagged comment explorer",
    explorerSub: "Sorted by risk score. Each row lists the cues that triggered the signal.",
    noSample: "No sample comments available",
    avg: "avg",
  },
  responsibleNotice:
    "Risk signals are indicators for manual review. They do not determine whether a comment is true or false. Scores combine transparent lexical cues and should be read as a prompt to verify, not a verdict.",
  cards: {
    executiveSummary: "Executive summary",
  },
  table: {
    comment: "Comment",
    sentiment: "Sentiment",
    confidence: "Confidence",
    issue: "Issue",
    risk: "Risk",
    whyFlagged: "Why flagged",
    score: "Score",
    comments: "Comments",
    share: "Share",
    negative: "Negative",
    dominant: "Dominant",
    severity: "Severity",
    searchPlaceholder: "Search comments",
    allSentiment: "All sentiment",
    allIssues: "All issues",
    allRisk: "All risk levels",
    anyConfidence: "Any confidence",
    matching: "matching comments",
    noMatchTitle: "No comments match these filters",
    noMatchDesc: "Try clearing the search or selecting a different category.",
  },
  charts: {
    noSentiment: "No sentiment data",
    noIssue: "No issue data",
    noRisk: "No risk data",
    noTimeline: "No timeline data",
    noConfidence: "No confidence data",
    commentsUnit: "comments",
  },
  demo: {
    title: "Try the analyzer",
    description:
      "Enter an Indonesian comment to see a predicted sentiment, issue, and risk signal. Runs locally in your browser using the same rule-based logic as the pipeline.",
    placeholder: "e.g. Semoga makanannya bergizi dan tidak basi",
    analyze: "Analyze",
    sentiment: "Sentiment",
    confidence: "Confidence",
    issue: "Issue",
    risk: "Risk",
    explanationLow: "No notable rumor or claim patterns were detected.",
    explanationFlagged: "Flagged for manual review because the comment contains {cues}.",
  },
  dataMissing: {
    title: "Analysis data not found",
    body: "The dashboard reads JSON files from web/public/data. Generate them by running the pipeline, or create placeholder data:",
  },
};

type Dictionary = typeof en;

const id: Dictionary = {
  nav: {
    home: { label: "Beranda", description: "Ringkasan proyek" },
    dashboard: { label: "Dasbor", description: "Ringkasan eksekutif" },
    sentiment: { label: "Sentimen", description: "Analisis sentimen" },
    issues: { label: "Isu", description: "Keresahan publik" },
    risk: { label: "Sinyal Risiko", description: "Komentar untuk ditinjau" },
  },
  common: {
    exploreDashboard: "Jelajahi dasbor",
    openDashboard: "Buka dasbor",
    viewGithub: "Lihat di GitHub",
    copySummary: "Salin ringkasan",
    copied: "Tersalin",
    viewOnKaggle: "Lihat dataset di Kaggle",
    page: "Halaman",
    of: "dari",
    prev: "Sebelumnya",
    next: "Berikutnya",
    language: "Bahasa",
  },
  sidebar: {
    dataLabel: "Data: komentar TikTok tentang MBG.",
    kaggleDataset: "Dataset Kaggle",
  },
  footer: {
    tagline: "VoxPop MBG — intelijen opini publik dari komentar TikTok tentang MBG.",
    dataSource: "Sumber data:",
    by: "oleh",
    disclaimer:
      "Sinyal risiko adalah indikator untuk peninjauan manual dan tidak menentukan benar atau salahnya sebuah komentar.",
  },
  home: {
    badge: "Analitik NLP untuk opini publik",
    tagline:
      "Intelijen opini publik dari komentar TikTok tentang MBG (Makan Bergizi Gratis).",
    subtitle:
      "Dasbor NLP full-stack yang menganalisis sentimen, isu publik, sinyal risiko, dan rekomendasi pemangku kepentingan dari komentar media sosial.",
    statComments: "Komentar dianalisis",
    statIssues: "Kategori isu",
    statFlagged: "Komentar ditandai untuk ditinjau",
    problemEyebrow: "Masalahnya",
    problemTitle: "Grafik sentimen saja tidak menjelaskan keresahan publik.",
    problemBody:
      "Percakapan tentang MBG di TikTok sangat banyak, informal, dan bising. Mengetahui komentar positif atau negatif tidak menjelaskan apa yang dipedulikan orang, isu mana yang memanas, atau narasi mana yang perlu diverifikasi. VoxPop MBG mengubah komentar tak terstruktur menjadi jawaban yang terstruktur.",
    questions: [
      "Bagaimana sentimen publik secara keseluruhan terhadap MBG?",
      "Isu apa yang paling sering dibicarakan orang?",
      "Isu mana yang terkait dengan sentimen negatif?",
      "Komentar mana yang memuat pola rumor atau klaim untuk ditinjau?",
      "Tindakan komunikasi apa yang harus diprioritaskan pemangku kepentingan?",
    ],
    featuresTitle: "Yang dicakup dasbor",
    featuresSubtitle: "Empat lapisan analisis, masing-masing dengan halaman dan detail pendukungnya.",
    features: [
      {
        title: "Analisis Sentimen",
        description:
          "Mengklasifikasikan komentar berbahasa Indonesia menjadi sinyal positif, negatif, netral, dan sarkas atau ambigu.",
      },
      {
        title: "Deteksi Isu",
        description:
          "Memetakan komentar ke kategori isu publik seperti kualitas makanan, transparansi anggaran, dan pemerataan distribusi.",
      },
      {
        title: "Pemantauan Sinyal Risiko",
        description:
          "Menyorot komentar dengan pola rumor atau klaim yang mungkin perlu verifikasi manual.",
      },
      {
        title: "Ringkasan Rekomendasi",
        description:
          "Menyuling hasil analisis agregat menjadi ringkasan eksekutif ringkas di dasbor.",
      },
    ],
    ctaTitle: "Lihat analisisnya langsung",
    ctaSubtitle: "Jelajahi ringkasan eksekutif, lalu telusuri sentimen, isu, dan sinyal risiko.",
  },
  dashboard: {
    eyebrow: "Ringkasan eksekutif",
    title: "Dasbor",
    description: "Analisis {count} komentar TikTok tentang MBG{range}.",
    metricTotal: "Total komentar",
    metricTotalSub: "Komentar unik dalam dataset",
    metricUsable: "Komentar layak pakai",
    metricUsableSub: "Setelah pembersihan dan deduplikasi",
    metricRemoved: "Dihapus",
    metricRemovedSub: "{empty} kosong · {dup} duplikat",
    metricFlagged: "Ditandai untuk ditinjau",
    metricFlaggedSub: "{pct} dari komentar layak pakai",
    sentimentDistribution: "Distribusi sentimen",
    topIssues: "Isu teratas",
    riskSignals: "Sinyal risiko",
    flagged: "Ditandai",
    highRisk: "Risiko tinggi",
    avgScore: "Rata-rata skor",
    representative: "Komentar representatif",
    methodologyNote:
      "Metrik dihitung dari JSON yang diekspor pipeline. Sentimen memakai weak labeling; penilaian risiko berbasis aturan dan menandai komentar untuk peninjauan manual.",
    method: "Metode",
    avgConfidence: "Rata-rata keyakinan",
  },
  sentiment: {
    eyebrow: "Analisis sentimen",
    title: "Sentimen",
    description:
      "Bagaimana komentar positif, negatif, netral, dan ambigu terdistribusi, lengkap dengan detail keyakinan dan tren.",
    distribution: "Distribusi",
    modelMetrics: "Metrik model",
    metricMethod: "Metode",
    metricLabelSource: "Sumber label",
    metricAccuracy: "Akurasi",
    metricMacroF1: "Macro F1",
    metricPrecision: "Presisi (macro)",
    metricRecall: "Recall (macro)",
    metricNote:
      "Metrik menggambarkan kesepakatan cross-validation dengan weak label, bukan akurasi yang ditinjau manusia.",
    notEvaluated: "Belum dievaluasi",
    overTime: "Sentimen dari waktu ke waktu",
    overTimeSub: "Volume komentar mingguan menurut sentimen.",
    confidence: "Rata-rata keyakinan per kelas",
    confidenceSub: "Rata-rata probabilitas prediksi per kelas sentimen.",
    explorer: "Penjelajah komentar",
    explorerSub:
      "Saring sampel yang sudah disanitasi berdasarkan sentimen, isu, risiko, dan keyakinan. Nama pengguna tidak pernah ditampilkan.",
  },
  issues: {
    eyebrow: "Deteksi isu",
    title: "Isu publik",
    description:
      "Apa yang dibicarakan orang, seberapa sering, dan seberapa negatif tiap topik. Kategori isu berasal dari taksonomi kata kunci terkurasi.",
    topByVolume: "Isu teratas menurut volume",
    topByVolumeSub: "Warna batang mencerminkan seberapa negatif tiap isu.",
    sentimentByIssue: "Sentimen per isu",
    sentimentByIssueSub: "Komposisi sentimen dalam tiap isu.",
    detail: "Detail isu",
    detailSub: "Severity menggabungkan volume, negativitas, dan keyakinan model.",
    allCategories: "Semua kategori",
    allCategoriesSub:
      "Rincian lengkap termasuk dukungan umum, penolakan, dan komentar tanpa kategori.",
    severity: "Severity",
    commentsWithShare: "{count} komentar ({share})",
    negativeShare: "{share} negatif",
  },
  risk: {
    eyebrow: "Sinyal risiko",
    title: "Komentar untuk ditinjau",
    description:
      "Komentar dengan pola rumor atau klaim yang mungkin perlu verifikasi manual. Ini alat bantu peninjauan, bukan penilaian benar atau salah.",
    flaggedComments: "Komentar ditandai",
    flaggedCommentsSub: "Risiko sedang ke atas",
    highRisk: "Risiko tinggi",
    highRiskSub: "Skor 60–79",
    needsVerification: "Perlu verifikasi",
    needsVerificationSub: "Skor 80–100",
    avgFlagged: "Rata-rata skor ditandai",
    avgFlaggedSub: "Di antara komentar yang ditandai",
    distribution: "Distribusi risiko",
    distributionSub: "Mayoritas komentar berisiko rendah; yang ditandai hanya sebagian kecil.",
    narratives: "Narasi risiko teratas",
    narrativesSub: "Dikelompokkan berdasarkan indikasi dominan di tiap komentar yang ditandai.",
    noNarratives: "Tidak ada narasi risiko yang teridentifikasi",
    explorer: "Penjelajah komentar ditandai",
    explorerSub: "Diurutkan berdasarkan skor risiko. Tiap baris mencantumkan indikasi pemicu sinyal.",
    noSample: "Tidak ada sampel komentar tersedia",
    avg: "rata-rata",
  },
  responsibleNotice:
    "Sinyal risiko adalah indikator untuk peninjauan manual. Sinyal ini tidak menentukan benar atau salahnya sebuah komentar. Skor menggabungkan indikasi leksikal yang transparan dan harus dibaca sebagai ajakan memverifikasi, bukan vonis.",
  cards: {
    executiveSummary: "Ringkasan eksekutif",
  },
  table: {
    comment: "Komentar",
    sentiment: "Sentimen",
    confidence: "Keyakinan",
    issue: "Isu",
    risk: "Risiko",
    whyFlagged: "Alasan ditandai",
    score: "Skor",
    comments: "Komentar",
    share: "Porsi",
    negative: "Negatif",
    dominant: "Dominan",
    severity: "Severity",
    searchPlaceholder: "Cari komentar",
    allSentiment: "Semua sentimen",
    allIssues: "Semua isu",
    allRisk: "Semua tingkat risiko",
    anyConfidence: "Keyakinan apa pun",
    matching: "komentar cocok",
    noMatchTitle: "Tidak ada komentar yang cocok dengan filter ini",
    noMatchDesc: "Coba kosongkan pencarian atau pilih kategori lain.",
  },
  charts: {
    noSentiment: "Tidak ada data sentimen",
    noIssue: "Tidak ada data isu",
    noRisk: "Tidak ada data risiko",
    noTimeline: "Tidak ada data linimasa",
    noConfidence: "Tidak ada data keyakinan",
    commentsUnit: "komentar",
  },
  demo: {
    title: "Coba penganalisis",
    description:
      "Masukkan komentar berbahasa Indonesia untuk melihat prediksi sentimen, isu, dan sinyal risiko. Berjalan lokal di peramban Anda memakai logika berbasis aturan yang sama dengan pipeline.",
    placeholder: "mis. Semoga makanannya bergizi dan tidak basi",
    analyze: "Analisis",
    sentiment: "Sentimen",
    confidence: "Keyakinan",
    issue: "Isu",
    risk: "Risiko",
    explanationLow: "Tidak terdeteksi pola rumor atau klaim yang menonjol.",
    explanationFlagged: "Ditandai untuk peninjauan manual karena komentar memuat {cues}.",
  },
  dataMissing: {
    title: "Data analisis tidak ditemukan",
    body: "Dasbor membaca berkas JSON dari web/public/data. Hasilkan dengan menjalankan pipeline, atau buat data placeholder:",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, id };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

const SENTIMENT_LABEL_I18N: Record<Locale, Record<SentimentLabel, string>> = {
  en: {
    positive: "Positive",
    negative: "Negative",
    neutral: "Neutral",
    sarcastic_or_ambiguous: "Sarcastic / Ambiguous",
  },
  id: {
    positive: "Positif",
    negative: "Negatif",
    neutral: "Netral",
    sarcastic_or_ambiguous: "Sarkas / Ambigu",
  },
};

const RISK_LABEL_I18N: Record<Locale, Record<RiskLevel, string>> = {
  en: {
    low: "Low Risk",
    medium: "Medium Risk",
    high: "High Risk",
    needs_verification: "Needs Verification",
  },
  id: {
    low: "Risiko Rendah",
    medium: "Risiko Sedang",
    high: "Risiko Tinggi",
    needs_verification: "Perlu Verifikasi",
  },
};

const NARRATIVE_I18N: Record<Locale, Record<string, string>> = {
  en: {
    food_safety: "Food safety and poisoning claims",
    corruption: "Budget and corruption accusations",
    rumor: "Unverified rumor claims",
    universal: "Sweeping generalizations",
    urgency: "Calls to spread information",
    question: "Claim-style questions",
  },
  id: {
    food_safety: "Klaim keamanan pangan dan keracunan",
    corruption: "Tuduhan anggaran dan korupsi",
    rumor: "Klaim rumor tak terverifikasi",
    universal: "Generalisasi berlebihan",
    urgency: "Ajakan menyebarkan informasi",
    question: "Pertanyaan bernada klaim",
  },
};

const ISSUE_NAME_I18N: Record<Locale, Record<string, string>> = {
  en: {
    food_safety: "Food Safety",
    food_quality: "Food Quality",
    budget_transparency: "Budget Transparency",
    distribution_fairness: "Distribution Fairness",
    regional_access: "Regional Access",
    political_framing: "Political Framing",
    implementation_quality: "Implementation Quality",
    eligibility: "Eligibility",
    student_benefit: "Student Benefit",
    question_or_information: "Question or Information",
    general_support: "General Support",
    general_rejection: "General Rejection",
    other: "Other",
  },
  id: {
    food_safety: "Keamanan Pangan",
    food_quality: "Kualitas Makanan",
    budget_transparency: "Transparansi Anggaran",
    distribution_fairness: "Pemerataan Distribusi",
    regional_access: "Akses Daerah",
    political_framing: "Framing Politik",
    implementation_quality: "Kualitas Pelaksanaan",
    eligibility: "Kelayakan Penerima",
    student_benefit: "Manfaat untuk Siswa",
    question_or_information: "Pertanyaan / Informasi",
    general_support: "Dukungan Umum",
    general_rejection: "Penolakan Umum",
    other: "Lainnya",
  },
};

export function sentimentLabel(label: SentimentLabel, locale: Locale): string {
  return SENTIMENT_LABEL_I18N[locale][label];
}

export function riskLabel(level: RiskLevel, locale: Locale): string {
  return RISK_LABEL_I18N[locale][level];
}

export function narrativeLabel(code: string, locale: Locale): string {
  return NARRATIVE_I18N[locale][code] ?? code;
}

export function issueName(
  issueId: string,
  locale: Locale,
  fallback?: string,
): string {
  return ISSUE_NAME_I18N[locale][issueId] ?? fallback ?? issueId;
}

const RISK_CUE_LABEL: Record<Locale, Record<string, string>> = {
  en: {
    rumor: "a rumor cue",
    universal: "a universal claim",
    food_safety: "a food safety claim",
    accusation: "an accusation cue",
    urgency: "an urgency cue",
    question: "a claim-style question",
  },
  id: {
    rumor: "indikasi rumor",
    universal: "klaim general",
    food_safety: "klaim keamanan pangan",
    accusation: "indikasi tuduhan",
    urgency: "ajakan menyebarkan",
    question: "pertanyaan bernada klaim",
  },
};

export function riskCueLabel(type: string, locale: Locale): string {
  return RISK_CUE_LABEL[locale][type] ?? type;
}
