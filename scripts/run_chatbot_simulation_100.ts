import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { calculateClinicalRiskAnalysis } from "../src/features/questionnaire/assessmentEngine";
import type { RiskProfileData } from "../src/services/symptom.service";
import questionsData from "../src/mocks/symptoms_questions.json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

// ── Types ─────────────────────────────────────────────────────────────
interface SimulatedSubject {
  subject_id: string;
  patient_name: string;
  cohort: string;
  clinical_archetype: string;
  timestamp: string;
  riskProfile: RiskProfileData;
  symptomAnswers: Record<string, "Yes" | "No">;
  analysis: ReturnType<typeof calculateClinicalRiskAnalysis>;
}

// Helper to pick random item from array
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Random probability check
function chance(prob: number): boolean {
  return Math.random() < prob;
}

// ── All 56 Symptom Keys ───────────────────────────────────────────────
const allSymptomKeys: string[] = [];
questionsData.forEach(cat => {
  cat.options.forEach(opt => {
    allSymptomKeys.push(opt.converted_name);
  });
});

// ── Synthetic Cohort Generator ────────────────────────────────────────
function generateSubject(index: number): SimulatedSubject {
  const idNum = String(index + 1).padStart(3, "0");
  const subject_id = `SIM-PAT-${idNum}`;
  const timestamp = new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000)).toISOString();

  let cohort = "";
  let archetype = "";
  let profile: RiskProfileData;
  const answers: Record<string, "Yes" | "No"> = {};

  // Initialize all symptom keys to "No"
  allSymptomKeys.forEach(k => {
    answers[k] = "No";
  });

  // Determine cohort bucket
  if (index < 30) {
    // ── COHORT 1: Low Risk / Routine Screening (30 subjects) ──────────
    cohort = "Cohort 1: Low Risk / Routine Screening";
    archetype = pick([
      "Young asymptomatic wellness check",
      "Perimenopausal routine breast screening",
      "Mild non-cyclical tender point, no lumps",
      "Young postpartum screening check"
    ]);

    profile = {
      age: pick(["< 30 years", "< 30 years", "30–40 years"]),
      ageAtMarriage: pick(["18–25 years", "26–30 years", "Unmarried / N/A"]),
      ageAtFirstChild: pick(["20–30 years", "No children"]),
      numberOfChildren: pick(["0", "1–2", "1–2"]),
      breastfeeding: pick(["6–12 months", "> 12 months", "< 6 months"]),
      contraceptives: pick(["Never / None", "Never / None", "< 1 year"]),
      familyHistory: "No family history",
      smoking: pick(["Never", "Never", "Former smoker"]),
      diet: pick(["Balanced diet", "Vegetarian / Plant-based", "Balanced diet"])
    };

    // 0 or at most 1 minor low-weight symptom (e.g. mild pain)
    if (chance(0.25)) {
      const mildSymptom = pick([
        "Symptoms on Left Breast – Pain",
        "Symptoms on Right Breast – Pain",
        "Symptoms on Left Arm – Pain",
        "Under Muscular Skeleton – Shoulder Pain"
      ]);
      answers[mildSymptom] = "Yes";
    }

  } else if (index < 55) {
    // ── COHORT 2: Moderate Risk (25 subjects) ─────────────────────────
    cohort = "Cohort 2: Moderate Risk (Reproductive / Mild Localized)";
    archetype = pick([
      "Late first childbirth + focal swelling",
      "Hormonal contraceptive use >5 yrs + cyclical breast mastalgia",
      "Nulliparous 42yo + mild skin thickening without lump",
      "Moderate lifestyle risk + shoulder / axillary ache"
    ]);

    profile = {
      age: pick(["30–40 years", "41–50 years", "41–50 years"]),
      ageAtMarriage: pick(["26–30 years", "> 30 years", "18–25 years"]),
      ageAtFirstChild: pick(["> 30 years", "20–30 years", "No children"]),
      numberOfChildren: pick(["0", "1–2"]),
      breastfeeding: pick(["Never", "< 6 months", "None"]),
      contraceptives: pick(["1–5 years", "> 5 years", "< 1 year"]),
      familyHistory: pick(["No family history", "Other relative with breast cancer", "No family history"]),
      smoking: pick(["Never", "Former smoker", "Current smoker"]),
      diet: pick(["High fat / processed foods", "Balanced diet"])
    };

    // 1 to 3 moderate non-emergency symptoms
    const candidateSymptoms = [
      "Symptoms on Left Breast – Pain",
      "Symptoms on Right Breast – Pain",
      "Symptoms on Left Breast – Redness",
      "Symptoms on Right Breast – Redness",
      "Symptoms on Left Arm – Swelling",
      "Symptoms on Right Arm – Swelling",
      "Symptoms on Left Arm – Pain",
      "Symptoms on Neck – Swelling",
      "Symptoms on Neck – Pain",
      "Under Muscular Skeleton – Muscle Weakness"
    ];
    const numSymptoms = pick([1, 2, 2, 3]);
    for (let i = 0; i < numSymptoms; i++) {
      answers[pick(candidateSymptoms)] = "Yes";
    }

  } else if (index < 80) {
    // ── COHORT 3: High Risk (25 subjects) ─────────────────────────────
    cohort = "Cohort 3: High Risk (Significant Suspicion / Palpable Lump)";
    archetype = pick([
      "Post-menopausal + palpable unilateral lump + family history",
      "Axillary lymphadenopathy + palpable breast mass",
      "Focal skin thickening + retraction without full triad",
      "High BRM score + palpable abnormality + arm weakness"
    ]);

    profile = {
      age: pick(["41–50 years", "> 50 years", "> 50 years"]),
      ageAtMarriage: pick(["18–25 years", "26–30 years", "> 30 years"]),
      ageAtFirstChild: pick(["> 30 years", "No children", "20–30 years"]),
      numberOfChildren: pick(["0", "1–2"]),
      breastfeeding: pick(["Never", "< 6 months", "Never"]),
      contraceptives: pick(["> 5 years", "1–5 years", "Never / None"]),
      familyHistory: pick([
        "Mother / Sister / Daughter with breast/ovarian cancer",
        "Mother / Sister / Daughter with breast/ovarian cancer",
        "Other relative with breast cancer"
      ]),
      smoking: pick(["Former smoker", "Current smoker", "Never"]),
      diet: pick(["High fat / processed foods", "Balanced diet"])
    };

    // Primary suspicious finding: Palpable lump
    const side = pick(["Left", "Right"]);
    answers[`Symptoms on ${side} Breast – Palpable Lump / Abnormality`] = "Yes";

    if (chance(0.6)) {
      answers[`Symptoms on ${side} Breast – Skin Thickening`] = "Yes";
    }
    if (chance(0.5)) {
      answers[`Symptoms on ${side} Arm – Axillary (Armpit) Lump`] = "Yes";
    }
    if (chance(0.4)) {
      answers[`Symptoms on ${side} Breast – Pain`] = "Yes";
    }
    if (chance(0.35)) {
      answers[`Symptoms on ${side} Arm – Swelling`] = "Yes";
    }

  } else if (index < 95) {
    // ── COHORT 4: Critical / Safety-Net Escalation (15 subjects) ───────
    const subType = (index - 80) % 3;

    if (subType === 0) {
      // Classic Malignancy Triad
      cohort = "Cohort 4: Urgent (Safety-Net: Classic Malignancy Triad)";
      archetype = "Triad Trigger: Nipple Retraction + Discharge + Skin Dimpling";
      const side = pick(["Left", "Right"]);

      profile = {
        age: pick(["41–50 years", "> 50 years"]),
        ageAtMarriage: "26–30 years",
        ageAtFirstChild: "> 30 years",
        numberOfChildren: "1–2",
        breastfeeding: "Never",
        contraceptives: "> 5 years",
        familyHistory: "Mother / Sister / Daughter with breast/ovarian cancer",
        smoking: "Former smoker",
        diet: "High fat / processed foods"
      };

      answers[`Symptoms on ${side} Breast – Nipple Retraction / Inversion`] = "Yes";
      answers[`Symptoms on ${side} Breast – Nipple Discharge`] = "Yes";
      answers[`Symptoms on ${side} Breast – Skin Dimpling`] = "Yes";
      if (chance(0.8)) answers[`Symptoms on ${side} Breast – Palpable Lump / Abnormality`] = "Yes";

    } else if (subType === 1) {
      // Metastatic Pattern Alert (Phase 1 Breast + Phase 3 Systemic)
      cohort = "Cohort 4: Urgent (Safety-Net: Metastatic Pattern Alert)";
      archetype = "Metastatic Alert: Palpable Breast Mass + Respiratory/Skeletal Symptoms";
      const side = pick(["Left", "Right"]);

      profile = {
        age: pick(["41–50 years", "> 50 years"]),
        ageAtMarriage: "18–25 years",
        ageAtFirstChild: "20–30 years",
        numberOfChildren: "1–2",
        breastfeeding: "< 6 months",
        contraceptives: "1–5 years",
        familyHistory: pick(["Mother / Sister / Daughter with breast/ovarian cancer", "No family history"]),
        smoking: pick(["Current smoker", "Never"]),
        diet: "Balanced diet"
      };

      answers[`Symptoms on ${side} Breast – Palpable Lump / Abnormality`] = "Yes";
      // Phase 3 systemic triggers
      if (chance(0.6)) answers["Respiratory Symptoms – Cough"] = "Yes";
      if (chance(0.5)) answers["Respiratory Symptoms – Breathlessness"] = "Yes";
      if (chance(0.7)) answers["Under Muscular Skeleton – Back Pain"] = "Yes";
      if (chance(0.4)) answers["CNS Symptoms – Headache"] = "Yes";

    } else {
      // Ulcerative / Open Skin Lesion
      cohort = "Cohort 4: Urgent (Safety-Net: Ulcerative Skin Lesion)";
      archetype = "Ulcerative Alert: Non-healing breast ulcer or open bleeding lesion";
      const side = pick(["Left", "Right"]);

      profile = {
        age: pick(["41–50 years", "> 50 years"]),
        ageAtMarriage: "18–25 years",
        ageAtFirstChild: "20–30 years",
        numberOfChildren: "3 or more",
        breastfeeding: "> 12 months",
        contraceptives: "Never / None",
        familyHistory: "No family history",
        smoking: "Never",
        diet: "Vegetarian / Plant-based"
      };

      answers[`Symptoms on ${side} Breast – Ulcer / Open Sore`] = "Yes";
      if (chance(0.5)) answers[`Symptoms on ${side} Breast – Redness`] = "Yes";
      if (chance(0.4)) answers["Symptoms on Neck – Wound"] = "Yes";
    }

  } else {
    // ── COHORT 5: Boundary & Edge Cases (5 subjects) ──────────────────
    cohort = "Cohort 5: Boundary & Stress Edge Cases";
    if (index === 95) {
      archetype = "Edge Case: Completely Asymptomatic (All 56 No, Zero BRM)";
      profile = {
        age: "< 30 years",
        ageAtMarriage: "26–30 years",
        ageAtFirstChild: "20–30 years",
        numberOfChildren: "1–2",
        breastfeeding: "> 12 months",
        contraceptives: "Never / None",
        familyHistory: "No family history",
        smoking: "Never",
        diet: "Balanced diet"
      };
      // All answers remain "No"
    } else if (index === 96) {
      archetype = "Edge Case: High BRM (Max Factors) but completely Asymptomatic";
      profile = {
        age: "> 50 years", // +2
        ageAtMarriage: "> 30 years",
        ageAtFirstChild: "> 30 years", // +1
        numberOfChildren: "0",
        breastfeeding: "Never", // +1
        contraceptives: "> 5 years", // +1
        familyHistory: "Mother / Sister / Daughter with breast/ovarian cancer", // +3
        smoking: "Current smoker", // +1
        diet: "High fat / processed foods"
      };
      // Zero symptoms -> tests whether BRM alone pushes tier correctly without multiplier inflation
    } else if (index === 97) {
      archetype = "Edge Case: Bilateral Synchronous Masses with Neck & Axilla Involvement";
      profile = {
        age: "> 50 years",
        ageAtMarriage: "18–25 years",
        ageAtFirstChild: "20–30 years",
        numberOfChildren: "1–2",
        breastfeeding: "Never",
        contraceptives: "1–5 years",
        familyHistory: "Mother / Sister / Daughter with breast/ovarian cancer",
        smoking: "Former smoker",
        diet: "Balanced diet"
      };
      answers["Symptoms on Left Breast – Palpable Lump / Abnormality"] = "Yes";
      answers["Symptoms on Right Breast – Palpable Lump / Abnormality"] = "Yes";
      answers["Symptoms on Left Arm – Axillary (Armpit) Lump"] = "Yes";
      answers["Symptoms on Right Arm – Axillary (Armpit) Lump"] = "Yes";
      answers["Symptoms on Neck – Lump"] = "Yes";
    } else if (index === 98) {
      archetype = "Edge Case: Isolated Systemic / CNS symptoms with zero breast complaints";
      profile = {
        age: "30–40 years",
        ageAtMarriage: "26–30 years",
        ageAtFirstChild: "20–30 years",
        numberOfChildren: "1–2",
        breastfeeding: "6–12 months",
        contraceptives: "Never / None",
        familyHistory: "No family history",
        smoking: "Never",
        diet: "Balanced diet"
      };
      answers["CNS Symptoms – Headache"] = "Yes";
      answers["CNS Symptoms – Giddiness"] = "Yes";
      answers["Under Muscular Skeleton – Back Pain"] = "Yes";
    } else {
      archetype = "Edge Case: Complex Elderly Smoker with Heavy Contraceptive History";
      profile = {
        age: "> 50 years",
        ageAtMarriage: "18–25 years",
        ageAtFirstChild: "No children",
        numberOfChildren: "0",
        breastfeeding: "Never",
        contraceptives: "> 5 years",
        familyHistory: "Other relative with breast cancer",
        smoking: "Current smoker",
        diet: "High fat / processed foods"
      };
      answers["Symptoms on Right Breast – Skin Dimpling"] = "Yes";
      answers["Symptoms on Right Breast – Pain"] = "Yes";
      answers["Symptoms on Right Arm – Restricted Movement"] = "Yes";
    }
  }

  // Generate a realistic Indian female patient name for realistic audit tracking
  const firstNames = [
    "Aaradhya", "Pooja", "Sunita", "Meera", "Ananya", "Deepa", "Kavita", "Sangeeta", "Rekha", "Ritu",
    "Priyanka", "Nisha", "Shalini", "Jyoti", "Mamta", "Anita", "Geeta", "Sarita", "Usha", "Lakshmi",
    "Manju", "Archana", "Vandana", "Swati", "Neha", "Preeti", "Komal", "Divya", "Smita", "Radha"
  ];
  const lastNames = [
    "Sharma", "Verma", "Patel", "Gupta", "Singh", "Yadav", "Kushwaha", "Joshi", "Mishra", "Trivedi",
    "Reddy", "Nair", "Iyer", "Banerjee", "Chatterjee", "Deshmukh", "Kulkarni", "Choudhary", "Shukla", "Pandey"
  ];
  const patient_name = `${firstNames[index % firstNames.length]} ${lastNames[(index * 3) % lastNames.length]}`;

  // Evaluate Clinical Engine
  const analysis = calculateClinicalRiskAnalysis(profile, answers);

  return {
    subject_id,
    patient_name,
    cohort,
    clinical_archetype: archetype,
    timestamp,
    riskProfile: profile,
    symptomAnswers: answers,
    analysis
  };
}

// ── Export Generators ─────────────────────────────────────────────────

function generateCsv(subjects: SimulatedSubject[]): string {
  // Define metadata columns
  const metaColumns = [
    "subject_id",
    "patient_name",
    "cohort",
    "clinical_archetype",
    "timestamp",
    "final_risk_tier",
    "total_clinical_score",
    "brm_score",
    "total_symptom_score",
    "phase1_raw_score",
    "phase1_multiplier",
    "phase1_weighted_score",
    "phase2_raw_score",
    "phase2_multiplier",
    "phase2_weighted_score",
    "phase3_raw_score",
    "phase3_multiplier",
    "phase3_weighted_score",
    "positive_symptoms_count",
    "escalation_override_triggered",
    "override_rule_name",
    "override_reason",
    "clinical_recommendation",
    // Phase 0 Demographic / Risk Profile Questions
    "q_age",
    "q_age_at_marriage",
    "q_age_at_first_child",
    "q_number_of_children",
    "q_breastfeeding",
    "q_contraceptives",
    "q_family_history",
    "q_smoking",
    "q_diet"
  ];

  // All 56 symptom questions as distinct columns
  const symptomColumns = allSymptomKeys.map(k => `sym_${k}`);
  const allHeaders = [...metaColumns, ...symptomColumns];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = subjects.map(s => {
    const positiveCount = Object.values(s.symptomAnswers).filter(v => v === "Yes").length;
    const values: any[] = [
      s.subject_id,
      s.patient_name,
      s.cohort,
      s.clinical_archetype,
      s.timestamp,
      s.analysis.tier,
      s.analysis.totalScore,
      s.analysis.brm.score,
      s.analysis.symptomScoring.totalSymptomScore,
      s.analysis.symptomScoring.phase1Score,
      s.analysis.symptomScoring.phase1Multiplier,
      s.analysis.symptomScoring.phase1Weighted,
      s.analysis.symptomScoring.phase2Score,
      s.analysis.symptomScoring.phase2Multiplier,
      s.analysis.symptomScoring.phase2Weighted,
      s.analysis.symptomScoring.phase3Score,
      s.analysis.symptomScoring.phase3Multiplier,
      s.analysis.symptomScoring.phase3Weighted,
      positiveCount,
      s.analysis.override.triggered ? "TRUE" : "FALSE",
      s.analysis.override.ruleName || "None",
      s.analysis.override.reason || "None",
      s.analysis.recommendation,
      // Phase 0 inputs
      s.riskProfile.age || "",
      s.riskProfile.ageAtMarriage || "",
      s.riskProfile.ageAtFirstChild || "",
      s.riskProfile.numberOfChildren || "",
      s.riskProfile.breastfeeding || "",
      s.riskProfile.contraceptives || "",
      s.riskProfile.familyHistory || "",
      s.riskProfile.smoking || "",
      s.riskProfile.diet || ""
    ];

    // Symptom inputs
    allSymptomKeys.forEach(k => {
      values.push(s.symptomAnswers[k] || "No");
    });

    return values.map(escapeCsv).join(",");
  });

  return [allHeaders.map(escapeCsv).join(","), ...rows].join("\n");
}

function generateMarkdownSummary(subjects: SimulatedSubject[]): string {
  const tierCounts: Record<string, number> = { Low: 0, Moderate: 0, High: 0, Urgent: 0 };
  const overrideCounts: Record<string, number> = {};
  let totalScoreSum = 0;
  let brmScoreSum = 0;
  let symptomScoreSum = 0;

  subjects.forEach(s => {
    tierCounts[s.analysis.tier] = (tierCounts[s.analysis.tier] || 0) + 1;
    totalScoreSum += s.analysis.totalScore;
    brmScoreSum += s.analysis.brm.score;
    symptomScoreSum += s.analysis.symptomScoring.totalSymptomScore;

    if (s.analysis.override.triggered && s.analysis.override.ruleName) {
      overrideCounts[s.analysis.override.ruleName] = (overrideCounts[s.analysis.override.ruleName] || 0) + 1;
    }
  });

  const avgTotal = (totalScoreSum / subjects.length).toFixed(1);
  const avgBrm = (brmScoreSum / subjects.length).toFixed(1);
  const avgSymptom = (symptomScoreSum / subjects.length).toFixed(1);

  let md = `# BreastCare AI - 100 Subject Simulation Audit Report\n\n`;
  md += `**Date of Simulation:** ${new Date().toLocaleString()}\n`;
  md += `**Total Subjects Evaluated:** ${subjects.length}\n`;
  md += `**Evaluation Engine:** Phased Clinical Oncology Triage Engine (v2.0)\n\n`;

  md += `## 1. Executive Tier Distribution\n\n`;
  md += `| Risk Tier | Count | Percentage | Clinical Protocol |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  md += `| **Low** | ${tierCounts.Low} | ${(tierCounts.Low)}% | Routine annual screening & monthly self-exams |\n`;
  md += `| **Moderate** | ${tierCounts.Moderate} | ${(tierCounts.Moderate)}% | Clinical breast exam & physician follow-up within 2-4 weeks |\n`;
  md += `| **High** | ${tierCounts.High} | ${(tierCounts.High)}% | Urgent specialist consultation & bilateral diagnostic imaging |\n`;
  md += `| **Urgent** | ${tierCounts.Urgent} | ${(tierCounts.Urgent)}% | Immediate safety-net referral (< 72 hours expedited pathway) |\n\n`;

  md += `## 2. Averages & Score Metrics\n\n`;
  md += `- **Average Total Clinical Score:** \`${avgTotal}\` points\n`;
  md += `- **Average Baseline Risk Modifier (BRM):** \`${avgBrm}\` points\n`;
  md += `- **Average Phased Symptom Score:** \`${avgSymptom}\` points\n\n`;

  md += `## 3. Safety-Net Escalation Overrides Triggered\n\n`;
  md += `| Safety Override Rule | Times Triggered | Description |\n`;
  md += `| :--- | :--- | :--- |\n`;
  Object.entries(overrideCounts).forEach(([rule, count]) => {
    md += `| **${rule}** | ${count} | Automatic escalation to Urgent tier regardless of numeric threshold |\n`;
  });
  if (Object.keys(overrideCounts).length === 0) {
    md += `| *None* | 0 | No overrides triggered |\n`;
  }
  md += `\n`;

  md += `## 4. Cohort Sample Table (First 15 Subjects)\n\n`;
  md += `| ID | Patient Name | Cohort | Age | BRM | Symptom Pts | Total | Tier | Override |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  subjects.slice(0, 15).forEach(s => {
    const ov = s.analysis.override.triggered ? `⚠️ ${s.analysis.override.ruleName}` : "None";
    md += `| \`${s.subject_id}\` | ${s.patient_name} | ${s.cohort.split(":")[0]} | ${s.riskProfile.age} | ${s.analysis.brm.score} | ${s.analysis.symptomScoring.totalSymptomScore} | **${s.analysis.totalScore}** | **${s.analysis.tier}** | ${ov} |\n`;
  });

  return md;
}

// ── Main Execution ────────────────────────────────────────────────────
async function runSimulation() {
  console.log("================================================================================");
  console.log("  NariSetu BreastCare AI - 100-Subject Clinical Chatbot Simulation Runner");
  console.log("================================================================================\n");
  console.log("Generating 100 unique simulated clinical subjects...");

  const subjects: SimulatedSubject[] = [];
  for (let i = 0; i < 100; i++) {
    subjects.push(generateSubject(i));
  }

  console.log(`✓ Successfully generated and scored ${subjects.length} unique subject evaluations.\n`);

  // Target file paths
  const csvPath = path.join(projectRoot, "simulation_results_100_subjects.csv");
  const publicCsvPath = path.join(projectRoot, "public", "simulation_results_100_subjects.csv");
  const jsonPath = path.join(projectRoot, "simulation_results_100_subjects.json");
  const mockJsonPath = path.join(projectRoot, "src", "mocks", "simulation_results_100_subjects.json");
  const mdPath = path.join(projectRoot, "simulation_report_summary.md");

  // Write CSV
  console.log("Exporting CSV file...");
  const csvContent = generateCsv(subjects);
  fs.writeFileSync(csvPath, csvContent, "utf8");
  try { fs.writeFileSync(publicCsvPath, csvContent, "utf8"); } catch (_) {}
  console.log(`✓ Saved: ${csvPath} (${(Buffer.byteLength(csvContent) / 1024).toFixed(1)} KB)`);

  // Write JSON
  console.log("Exporting detailed JSON file...");
  const jsonContent = JSON.stringify(subjects, null, 2);
  fs.writeFileSync(jsonPath, jsonContent, "utf8");
  try { fs.writeFileSync(mockJsonPath, jsonContent, "utf8"); } catch (_) {}
  console.log(`✓ Saved: ${jsonPath} (${(Buffer.byteLength(jsonContent) / 1024).toFixed(1)} KB)`);

  // Write Markdown summary
  console.log("Exporting Markdown audit summary...");
  const mdContent = generateMarkdownSummary(subjects);
  fs.writeFileSync(mdPath, mdContent, "utf8");
  console.log(`✓ Saved: ${mdPath}\n`);

  // Print Terminal Summary
  const tierCounts: Record<string, number> = { Low: 0, Moderate: 0, High: 0, Urgent: 0 };
  let overrideCount = 0;
  subjects.forEach(s => {
    tierCounts[s.analysis.tier] = (tierCounts[s.analysis.tier] || 0) + 1;
    if (s.analysis.override.triggered) overrideCount++;
  });

  console.log("--------------------------------------------------------------------------------");
  console.log("  SIMULATION AUDIT SUMMARY (100 SUBJECTS)");
  console.log("--------------------------------------------------------------------------------");
  console.log(`  🟢 Low Risk:      ${tierCounts.Low.toString().padStart(3, " ")} (${tierCounts.Low}%)`);
  console.log(`  🟡 Moderate Risk: ${tierCounts.Moderate.toString().padStart(3, " ")} (${tierCounts.Moderate}%)`);
  console.log(`  🟠 High Risk:     ${tierCounts.High.toString().padStart(3, " ")} (${tierCounts.High}%)`);
  console.log(`  🔴 Urgent Risk:   ${tierCounts.Urgent.toString().padStart(3, " ")} (${tierCounts.Urgent}%)`);
  console.log(`  ⚠️  Safety-Net Overrides Triggered: ${overrideCount} cases`);
  console.log("--------------------------------------------------------------------------------");
  console.log(`\nAll 100 records are ready! Open "${path.basename(csvPath)}" directly in Excel.`);
  console.log("================================================================================\n");
}

runSimulation().catch(err => {
  console.error("Simulation failed:", err);
  process.exit(1);
});
