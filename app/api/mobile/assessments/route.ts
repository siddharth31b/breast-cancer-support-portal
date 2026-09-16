import { NextResponse } from "next/server";
import {
  calculateCareGuidance,
  calculateClinicalRiskAnalysis,
  calculateBaselineRiskModifier,
  calculatePhasedSymptomScore,
  checkEscalationOverrides,
  mapAnswersToSymptomKeys,
  SYMPTOM_KEYS,
} from "@/features/questionnaire/assessmentEngine";
import type {
  QuestionnaireAnswer,
  QuestionnaireSession,
  QuestionnaireSummary,
  ClinicalPriorityFlag,
  PatientRecord,
} from "@/types/questionnaire";
import type { RiskProfileData } from "@/services/symptom.service";
import questionsData from "@/mocks/symptoms_questions.json";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "scratch", "mobile_assessments.json");

function getStoredMobileAssessments(): PatientRecord[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        return list.map(normalizeStoredAssessment);
      }
    }
  } catch (err) {
    console.error("Error reading mobile_assessments.json:", err);
  }
  return [];
}

function saveStoredMobileAssessments(assessments: PatientRecord[]) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(assessments, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing mobile_assessments.json:", err);
  }
}

/**
 * Builds a complete, rich PatientRecord & QuestionnaireSession from mobile submission answers.
 */
function processMobileSubmission(body: any): PatientRecord {
  const rawAnswers: QuestionnaireAnswer[] = Array.isArray(body.answers) ? body.answers : [];

  const finalPatientId =
    body.patientId ||
    body.userId ||
    (body.email ? `pat-${String(body.email).replace(/[^a-zA-Z0-9]/g, "_")}` : `mob-pat-${Date.now()}`);

  const displayName = body.patientName || body.userName || body.name || "Mobile App Patient";
  const displayEmail = body.patientEmail || body.userEmail || body.email || "patient@mobile.breastcare.ai";

  const getAnsVal = (qId: string): any => {
    const found = rawAnswers.find(
      (a) => a.questionId?.toLowerCase() === qId.toLowerCase()
    );
    return found ? found.value : undefined;
  };

  // 1. Identify primary concerns & answers dictionary
  const answersDict: Record<string, "Yes" | "No"> = {};

  // Check direct converted name answers (from Chatbot / checklist)
  rawAnswers.forEach((a) => {
    if (a.questionId && (a.questionId.includes("–") || a.questionId.includes("-"))) {
      if (a.value === "Yes" || a.value === "yes" || a.value === true) {
        answersDict[a.questionId] = "Yes";
      } else if (a.value === "No" || a.value === "no" || a.value === false) {
        answersDict[a.questionId] = "No";
      }
    }
  });

  // Check 17-step wizard concerns
  const currentConcerns = (
    Array.isArray(getAnsVal("CURRENT_CONCERN"))
      ? getAnsVal("CURRENT_CONCERN")
      : [getAnsVal("CURRENT_CONCERN")].filter(Boolean)
  ) as string[];

  const breastSideVal = String(getAnsVal("BREAST_SIDE") || getAnsVal("breast_side") || "both").toLowerCase();
  const isLeft = breastSideVal === "left" || breastSideVal === "both" || breastSideVal === "not_sure";
  const isRight = breastSideVal === "right" || breastSideVal === "both" || breastSideVal === "not_sure";

  const shapeFollowup = (Array.isArray(getAnsVal("SHAPE_FOLLOWUP")) ? getAnsVal("SHAPE_FOLLOWUP") : []) as string[];
  const woundFollowup = (Array.isArray(getAnsVal("WOUND_FOLLOWUP")) ? getAnsVal("WOUND_FOLLOWUP") : []) as string[];
  const dischargeFollowup = (Array.isArray(getAnsVal("DISCHARGE_FOLLOWUP")) ? getAnsVal("DISCHARGE_FOLLOWUP") : []) as string[];
  const painFollowup = (Array.isArray(getAnsVal("PAIN_FOLLOWUP")) ? getAnsVal("PAIN_FOLLOWUP") : []) as string[];
  const lumpFollowup = (Array.isArray(getAnsVal("LUMP_FOLLOWUP")) ? getAnsVal("LUMP_FOLLOWUP") : []) as string[];
  const neckFollowup = (Array.isArray(getAnsVal("NECK_LUMP_FOLLOWUP")) ? getAnsVal("NECK_LUMP_FOLLOWUP") : []) as string[];
  const armpitFollowup = (Array.isArray(getAnsVal("ARMPIT_LUMP_FOLLOWUP")) ? getAnsVal("ARMPIT_LUMP_FOLLOWUP") : []) as string[];
  const respFollowup = (Array.isArray(getAnsVal("RESPIRATORY_FOLLOWUP")) ? getAnsVal("RESPIRATORY_FOLLOWUP") : []) as string[];
  const cnsFollowup = (Array.isArray(getAnsVal("CNS_FOLLOWUP")) ? getAnsVal("CNS_FOLLOWUP") : []) as string[];
  const backFollowup = (Array.isArray(getAnsVal("BACK_SHOULDER_FOLLOWUP")) ? getAnsVal("BACK_SHOULDER_FOLLOWUP") : []) as string[];

  // Breast Pain
  if (currentConcerns.includes("breast_pain")) {
    if (isLeft) answersDict["Symptoms on Left Breast – Pain"] = "Yes";
    if (isRight) answersDict["Symptoms on Right Breast – Pain"] = "Yes";
  }

  // Breast Lump
  if (currentConcerns.includes("breast_lump")) {
    if (isLeft) answersDict["Symptoms on Left Breast – Palpable Lump / Abnormality"] = "Yes";
    if (isRight) answersDict["Symptoms on Right Breast – Palpable Lump / Abnormality"] = "Yes";
  }

  // Shape & Skin changes
  if (currentConcerns.includes("breast_shape") || shapeFollowup.length > 0) {
    if (shapeFollowup.includes("skin_dimpling") || shapeFollowup.length === 0) {
      if (isLeft) answersDict["Symptoms on Left Breast – Skin Dimpling"] = "Yes";
      if (isRight) answersDict["Symptoms on Right Breast – Skin Dimpling"] = "Yes";
    }
    if (shapeFollowup.includes("orange_peel")) {
      if (isLeft) answersDict["Symptoms on Left Breast – Skin Thickening"] = "Yes";
      if (isRight) answersDict["Symptoms on Right Breast – Skin Thickening"] = "Yes";
    }
    if (shapeFollowup.includes("skin_redness")) {
      if (isLeft) answersDict["Symptoms on Left Breast – Redness"] = "Yes";
      if (isRight) answersDict["Symptoms on Right Breast – Redness"] = "Yes";
    }
    if (shapeFollowup.includes("nipple_retraction")) {
      if (isLeft) answersDict["Symptoms on Left Breast – Nipple Retraction / Inversion"] = "Yes";
      if (isRight) answersDict["Symptoms on Right Breast – Nipple Retraction / Inversion"] = "Yes";
    }
  }

  // Wounds & Sores
  if (currentConcerns.includes("breast_wound") || woundFollowup.length > 0) {
    if (isLeft) answersDict["Symptoms on Left Breast – Ulcer / Open Sore"] = "Yes";
    if (isRight) answersDict["Symptoms on Right Breast – Ulcer / Open Sore"] = "Yes";
  }

  // Nipple Discharge
  if (currentConcerns.includes("nipple_discharge") || dischargeFollowup.length > 0) {
    if (isLeft) answersDict["Symptoms on Left Breast – Nipple Discharge"] = "Yes";
    if (isRight) answersDict["Symptoms on Right Breast – Nipple Discharge"] = "Yes";
  }

  // Neck
  if (currentConcerns.includes("neck_lump") || neckFollowup.length > 0) {
    answersDict["Symptoms on Neck – Lump"] = "Yes";
    if (neckFollowup.includes("fever_yes")) answersDict["Symptoms on Neck – Redness"] = "Yes";
  }

  // Armpit / Axilla
  if (currentConcerns.includes("armpit_lump") || armpitFollowup.length > 0) {
    if (isLeft) answersDict["Symptoms on Left Arm – Axillary (Armpit) Lump"] = "Yes";
    if (isRight) answersDict["Symptoms on Right Arm – Axillary (Armpit) Lump"] = "Yes";
  }

  // Respiratory
  if (currentConcerns.includes("cough") || respFollowup.includes("cough")) {
    answersDict["Respiratory Symptoms – Cough"] = "Yes";
  }
  if (currentConcerns.includes("breathlessness") || respFollowup.some((v) => v.includes("sob"))) {
    answersDict["Respiratory Symptoms – Breathlessness"] = "Yes";
  }
  if (respFollowup.includes("chest_pain")) {
    answersDict["Respiratory Symptoms – Chest Pain"] = "Yes";
  }
  if (respFollowup.includes("wheezing")) {
    answersDict["Respiratory Symptoms – Wheezing"] = "Yes";
  }

  // CNS
  if (currentConcerns.includes("headache_dizziness") || cnsFollowup.includes("severe_headache")) {
    answersDict["CNS Symptoms – Headache"] = "Yes";
  }
  if (cnsFollowup.includes("vision_changes")) {
    answersDict["CNS Symptoms – Blurred Vision"] = "Yes";
  }
  if (cnsFollowup.includes("giddiness") || currentConcerns.includes("headache_dizziness")) {
    answersDict["CNS Symptoms – Giddiness"] = "Yes";
  }
  if (currentConcerns.includes("nausea_vomiting") || cnsFollowup.includes("nausea")) {
    answersDict["CNS Symptoms – Nausea"] = "Yes";
  }
  if (currentConcerns.includes("nausea_vomiting") || cnsFollowup.includes("vomiting")) {
    answersDict["CNS Symptoms – Vomiting"] = "Yes";
  }
  if (currentConcerns.includes("convulsion") || cnsFollowup.includes("seizure")) {
    answersDict["CNS Symptoms – Convulsions"] = "Yes";
  }

  // Musculoskeletal
  if (currentConcerns.includes("back_pain") || backFollowup.includes("back_pain")) {
    answersDict["Under Muscular Skeleton – Back Pain"] = "Yes";
  }
  if (currentConcerns.includes("shoulder_pain") || backFollowup.includes("shoulder_pain")) {
    answersDict["Under Muscular Skeleton – Shoulder Pain"] = "Yes";
  }
  if (currentConcerns.includes("underarm_pain")) {
    answersDict["Under Muscular Skeleton – Underarm Pain"] = "Yes";
  }

  // 2. Format presentable names for summary and main concerns
  const concernLabelMap: Record<string, string> = {
    breast_pain: "Breast Pain",
    breast_lump: "Palpable Breast Lump",
    breast_shape: "Breast Shape / Skin Changes",
    breast_wound: "Breast Wound / Sore",
    nipple_discharge: "Nipple Discharge",
    neck_lump: "Neck Lump",
    armpit_lump: "Armpit / Axillary Lump",
    underarm_pain: "Underarm Pain",
    shoulder_pain: "Shoulder Pain",
    back_pain: "Back Pain",
    abdominal: "Abdominal Concern",
    cough: "Cough",
    breathlessness: "Breathlessness / SOB",
    headache_dizziness: "Headache & Dizziness",
    nausea_vomiting: "Nausea & Vomiting",
    convulsion: "Convulsions / Seizure",
    no_symptoms: "Routine Screening",
  };

  const primaryConcernsFormatted = currentConcerns.map(
    (c) => concernLabelMap[c] || c.replace(/_/g, " ")
  );

  if (primaryConcernsFormatted.length === 0) {
    const positiveSymptoms = Object.entries(answersDict)
      .filter(([_, v]) => v === "Yes")
      .map(([k]) => k.split("–")[1]?.trim() || k);
    if (positiveSymptoms.length > 0) {
      primaryConcernsFormatted.push(...positiveSymptoms.slice(0, 4));
    } else {
      primaryConcernsFormatted.push("Routine Screening");
    }
  }

  const durationVal = String(getAnsVal("DURATION") || painFollowup[0] || lumpFollowup[0] || "1_3m");
  const durationLabelMap: Record<string, string> = {
    lt_2w: "Less than 2 weeks",
    dur_1w: "Less than 1 week",
    "2_4w": "2–4 weeks",
    dur_1_4w: "1–4 weeks",
    "1_3m": "1–3 months",
    dur_1_3m: "1–3 months",
    gt_3m: "More than 3 months",
    dur_3m_plus: "More than 3 months",
  };
  const durationDisplay = durationLabelMap[durationVal] || durationVal.replace(/_/g, " ");

  const progressionVal = String(getAnsVal("PROGRESSION") || "stable");
  const progressionLabelMap: Record<string, string> = {
    worse_rapid: "Rapidly worsening",
    worse_gradual: "Gradually worsening",
    stable: "Stable",
    improving: "Improving",
    fluctuating: "Fluctuating",
  };
  const progressionDisplay = progressionLabelMap[progressionVal] || progressionVal;

  const breastSideDisplay =
    breastSideVal === "left"
      ? "Left"
      : breastSideVal === "right"
      ? "Right"
      : breastSideVal === "both"
      ? "Bilateral"
      : "Not specified";

  const historyVal = (Array.isArray(getAnsVal("HISTORY_SUMMARY")) ? getAnsVal("HISTORY_SUMMARY") : []) as string[];
  const hasFamilyHistory =
    historyVal.includes("family_cancer") ||
    rawAnswers.some((a) => a.questionId === "q_family_history" && a.value === true) ||
    !!body.riskProfile?.familyHistory;
  const hasBiopsy =
    historyVal.includes("prior_biopsy") ||
    rawAnswers.some((a) => a.questionId === "q_previous_procedure" && a.value === true);
  const hasMammogram =
    historyVal.includes("prior_mammogram") ||
    rawAnswers.some((a) => a.questionId === "q_prior_imaging" && a.value === true);

  // 3. Build Risk Profile & Compute Phased Scoring
  const riskProfile: RiskProfileData = {
    age: String(body.riskProfile?.age || body.age || 38),
    ageAtMarriage: String(body.riskProfile?.ageAtMarriage || ""),
    ageAtFirstChild: String(body.riskProfile?.ageAtFirstChild || ""),
    numberOfChildren: String(body.riskProfile?.numberOfChildren || ""),
    breastfeeding: String(body.riskProfile?.breastfeeding || ""),
    contraceptives: String(body.riskProfile?.contraceptives || ""),
    familyHistory: hasFamilyHistory
      ? "Yes, family history reported"
      : String(body.riskProfile?.familyHistory || "No family history"),
    smoking: String(body.riskProfile?.smoking || "Never smoked"),
    diet: String(body.riskProfile?.diet || "Standard diet"),
  };

  const riskAnalysis = body.riskAnalysis || calculateClinicalRiskAnalysis(riskProfile, answersDict);
  const guidance = calculateCareGuidance(rawAnswers);

  // 4. Build Phased Answers Checklist (Phase 0, 1, 2, 3)
  const phase0Items = [
    { label: "Patient Age / Group", value: String(riskProfile.age || "38 years") },
    { label: "Age at Marriage", value: riskProfile.ageAtMarriage || "Not specified" },
    { label: "Age at First Childbirth", value: riskProfile.ageAtFirstChild || "Not specified" },
    { label: "Number of Children", value: riskProfile.numberOfChildren || "0" },
    { label: "Breastfeeding History", value: riskProfile.breastfeeding || "Not specified" },
    { label: "Hormonal Contraceptive Use", value: riskProfile.contraceptives || "None reported" },
    { label: "Family History of Breast/Ovarian Cancer", value: riskProfile.familyHistory || "No family history" },
    { label: "Smoking Status", value: riskProfile.smoking || "Never smoked" },
    { label: "General Diet & Nutrition", value: riskProfile.diet || "Standard" },
  ];

  const phase1Items: { symptom: string; response: string; relevance?: string; weight?: number }[] = [];
  const phase2Items: { symptom: string; response: string; relevance?: string; weight?: number }[] = [];
  const phase3Items: { symptom: string; response: string; relevance?: string; weight?: number }[] = [];

  (questionsData as any[]).forEach((cat) => {
    const phase = cat.phase || (cat.category.includes("Breast") ? 1 : cat.category.includes("Neck") || cat.category.includes("Arm") ? 2 : 3);
    cat.options.forEach((opt: any) => {
      const isYes =
        answersDict[opt.converted_name] === "Yes" ||
        rawAnswers.some(
          (a) =>
            a.questionId?.toLowerCase() === opt.converted_name?.toLowerCase() &&
            (a.value === "Yes" || a.value === "yes" || a.value === true)
        );

      const item = {
        symptom: opt.label || opt.converted_name,
        response: isYes ? "Yes" : "No",
        relevance: opt.relevance || "M",
        weight: opt.weight || 2,
      };

      if (phase === 1) phase1Items.push(item);
      else if (phase === 2) phase2Items.push(item);
      else phase3Items.push(item);
    });
  });

  // 5. Generate Priority Flags & Doctor Summary
  const priorityFlags: ClinicalPriorityFlag[] = [];
  if (
    answersDict["Symptoms on Left Breast – Palpable Lump / Abnormality"] === "Yes" ||
    answersDict["Symptoms on Right Breast – Palpable Lump / Abnormality"] === "Yes"
  ) {
    priorityFlags.push({
      type: "NEW_PERSISTENT_LUMP",
      severity: "HIGH",
      message: "Palpable breast lump or thickening reported.",
    });
  }
  if (
    answersDict["Symptoms on Left Breast – Nipple Discharge"] === "Yes" ||
    answersDict["Symptoms on Right Breast – Nipple Discharge"] === "Yes"
  ) {
    priorityFlags.push({
      type: "BLOODY_DISCHARGE",
      severity: "CRITICAL",
      message: "Nipple discharge reported.",
    });
  }
  if (
    answersDict["Symptoms on Left Breast – Skin Dimpling"] === "Yes" ||
    answersDict["Symptoms on Right Breast – Skin Dimpling"] === "Yes" ||
    answersDict["Symptoms on Left Breast – Skin Thickening"] === "Yes" ||
    answersDict["Symptoms on Right Breast – Skin Thickening"] === "Yes"
  ) {
    priorityFlags.push({
      type: "SKIN_CHANGES",
      severity: "HIGH",
      message: "Breast skin dimpling, retraction, or orange-peel thickening reported.",
    });
  }
  if (answersDict["CNS Symptoms – Convulsions"] === "Yes") {
    priorityFlags.push({
      type: "CONVULSION",
      severity: "CRITICAL",
      message: "Convulsion or seizure-like episode reported.",
    });
  }

  const doctorSummaryItems = [
    { label: "Main Concern", value: primaryConcernsFormatted.join(", ") },
    { label: "Affected Side", value: breastSideDisplay },
    { label: "Duration", value: durationDisplay },
    { label: "Progression", value: progressionDisplay },
    { label: "Family History", value: hasFamilyHistory ? "Positive" : "None reported" },
    { label: "Risk Tier", value: `${riskAnalysis.tier} Risk (${riskAnalysis.totalScore} pts)` },
  ];

  const symptomsSummaryStr = primaryConcernsFormatted.join(", ");
  const clinicalNote = `[MOBILE SELF-ASSESSMENT] Priority Tier: ${riskAnalysis.tier} (${riskAnalysis.totalScore} pts). Symptoms: ${symptomsSummaryStr}. Guidance: ${riskAnalysis.recommendation || guidance.message}`;

  const formattedDate = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const finalPriority: "HIGH" | "MEDIUM" | "LOW" =
    riskAnalysis.tier === "Urgent" || riskAnalysis.tier === "High" || guidance.level === "HIGH" || priorityFlags.some((f) => f.severity === "CRITICAL")
      ? "HIGH"
      : riskAnalysis.tier === "Moderate" || guidance.level === "MEDIUM" || primaryConcernsFormatted.length > 0
      ? "MEDIUM"
      : "LOW";

  // 6. Construct complete QuestionnaireSession
  const assessmentSession: QuestionnaireSession = {
    id: `sess-${Date.now()}`,
    patientId: finalPatientId,
    status: "SUBMITTED",
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    answers: rawAnswers,
    careGuidanceLevel: riskAnalysis.tier === "Urgent" ? "URGENT" : (riskAnalysis.tier === "High" ? "HIGH" : riskAnalysis.tier === "Moderate" ? "MEDIUM" : "LOW"),
    guidanceReasons: riskAnalysis.override?.triggered
      ? [riskAnalysis.override.reason || "Safety escalation triggered"]
      : guidance.reasons,
    selectedSymptomKeys: guidance.selectedSymptomKeys,
    priorityFlags,
    summary: {
      affectedSide: breastSideVal === "left" ? "LEFT" : breastSideVal === "right" ? "RIGHT" : breastSideVal === "both" ? "BOTH" : "NONE",
      symptoms: primaryConcernsFormatted,
      duration: durationDisplay,
      progression: progressionDisplay,
      familyHistory: hasFamilyHistory,
      previousBreastProcedure: hasBiopsy,
      priorImaging: hasMammogram,
      patientNote: body.patientNote || `Submitted via BreastCare AI Mobile App. Risk: ${riskAnalysis.tier}`,
      careGuidanceLevel: riskAnalysis.tier === "Urgent" ? "URGENT" : (riskAnalysis.tier === "High" ? "HIGH" : riskAnalysis.tier === "Moderate" ? "MEDIUM" : "LOW"),
      guidanceReasons: riskAnalysis.override?.triggered
        ? [riskAnalysis.override.reason || "Safety escalation triggered"]
        : guidance.reasons,
      selectedSymptomKeys: guidance.selectedSymptomKeys,
      version: "3.0-mobile-triage",
      assessmentMode: body.riskAnalysis || body.riskProfile ? "CHATBOT" : "MANUAL",
      riskProfile,
      riskAnalysis: {
        totalScore: riskAnalysis.totalScore,
        tier: riskAnalysis.tier,
        brmScore: riskAnalysis.brm?.score ?? 0,
        symptomScore: riskAnalysis.symptomScoring?.totalSymptomScore ?? 0,
        overrideTriggered: riskAnalysis.override?.ruleName || null,
        overrideReason: riskAnalysis.override?.reason || null,
        interpretation: riskAnalysis.interpretation,
        recommendation: riskAnalysis.recommendation,
        phase1Weighted: riskAnalysis.symptomScoring?.phase1Weighted ?? 0,
        phase2Weighted: riskAnalysis.symptomScoring?.phase2Weighted ?? 0,
        phase3Weighted: riskAnalysis.symptomScoring?.phase3Weighted ?? 0,
        phase2Multiplier: riskAnalysis.symptomScoring?.phase2Multiplier ?? 1.2,
        phase3Multiplier: riskAnalysis.symptomScoring?.phase3Multiplier ?? 1.3,
      },
      phasedAnswers: {
        phase0: phase0Items,
        phase1: phase1Items,
        phase2: phase2Items,
        phase3: phase3Items,
      },
    },
  };

  // 7. Construct Full Doctor Portal Patient Record
  const doctorPatientRecord: PatientRecord = {
    id: finalPatientId,
    name: displayName,
    age: typeof body.age === "number" ? body.age : parseInt(riskProfile.age, 10) || 38,
    gender: "Female",
    contactPreference: `App (${displayEmail})`,
    hospitalName: "IIT Indore Clinical Network",
    dob: "1988-06-15",
    phone: body.phone || "+91 98765-00000",
    email: displayEmail,
    address: "Submitted via BreastCare AI Mobile App",
    preferredLanguage: "English",
    emergencyContact: "+91 99999-00000",
    emergencyRelationship: "Family",
    medicalHistory: {
      familyHistory: hasFamilyHistory,
      previousBreastProcedure: hasBiopsy,
      priorImaging: hasMammogram,
      recentInjury: false,
    },
    assessmentSession,
    reports: [
      {
        id: `rep-${Date.now()}`,
        patientId: finalPatientId,
        title: "Mobile Clinical Self-Assessment Report",
        category: "Clinical Assessment",
        uploadedAt: formattedDate,
        validationStatus: "Validated",
        source: "Mobile App Self-Assessment",
        downloadable: true,
        shareable: true,
        date: formattedDate,
        status: "Submitted",
        type: "clinical_note",
        summary: clinicalNote,
      },
    ],
    clinicalJourney: {
      assessmentSubmitted: true,
      reportsUploaded: true,
      aiAnalysisStatus: "COMPLETE",
      radiologyStatus: "PENDING",
      doctorReviewStatus: "AWAITING_REVIEW",
      appointmentStatus: "NOT_SCHEDULED",
      waitingTime: "Just now",
    },
    clinicalIntake: {
      patientId: finalPatientId,
      status: "SUBMITTED",
      source: "PATIENT",
      submittedAt: new Date().toISOString(),
      answers: {
        main_concern: primaryConcernsFormatted,
        affectedSide: breastSideDisplay,
        affected_side: breastSideDisplay,
        duration: durationDisplay,
        symptom_duration: durationDisplay,
        progression: progressionDisplay,
        family_history: hasFamilyHistory ? "yes" : "no",
        symptomsSummary: symptomsSummaryStr,
      },
    },
    priority: finalPriority,
    status: "Awaiting Review",
    timeInQueue: "Just now",
  };

  return doctorPatientRecord;
}

/**
 * Normalizes an existing stored assessment record to ensure it contains full assessmentSession and clinicalIntake.
 */
function normalizeStoredAssessment(record: any): PatientRecord {
  if (record.assessmentSession && record.clinicalIntake?.answers?.main_concern) {
    return record as PatientRecord;
  }
  // Re-process with existing answers
  const answers = record.clinicalIntake?.answers || record.assessmentSession?.answers || [];
  const normalized = processMobileSubmission({
    ...record,
    answers: Array.isArray(answers) ? answers : record.answers || [],
    patientId: record.id,
    patientName: record.name,
    patientEmail: record.email,
  });
  return { ...record, ...normalized };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.answers || !Array.isArray(body.answers)) {
      return NextResponse.json(
        { error: "Invalid answers array provided" },
        { status: 400 }
      );
    }

    // 1. Process submission into full PatientRecord & AssessmentSession
    const doctorPatientRecord = processMobileSubmission(body);

    // 2. Save to persistent file cache for web portal sync
    const list = getStoredMobileAssessments();
    const existingIdx = list.findIndex(
      (p) => p.id === doctorPatientRecord.id || (doctorPatientRecord.email && p.email === doctorPatientRecord.email)
    );
    if (existingIdx >= 0) {
      list[existingIdx] = doctorPatientRecord;
    } else {
      list.unshift(doctorPatientRecord);
    }
    saveStoredMobileAssessments(list);

    // 3. Try saving to Prisma DB (if available)
    try {
      if (doctorPatientRecord.id) {
        const user = await prisma.user.findUnique({ where: { id: doctorPatientRecord.id } });
        if (user) {
          let profile = await prisma.patientProfile.findUnique({ where: { userId: user.id } });
          if (!profile) {
            profile = await prisma.patientProfile.create({ data: { userId: user.id } });
          }
          await prisma.diagnosticStudy.create({
            data: {
              patientId: profile.id,
              studyType: "Mobile Self-Assessment",
              aiRiskScore: doctorPatientRecord.priority === "HIGH" ? 0.85 : doctorPatientRecord.priority === "MEDIUM" ? 0.55 : 0.15,
              clinicalNotes: doctorPatientRecord.reports?.[0]?.summary || "Mobile Assessment Submitted",
              status: "QUEUED",
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("Prisma save warning (continuing with JSON store):", dbErr);
    }

    const summary = doctorPatientRecord.assessmentSession?.summary;

    return NextResponse.json(
      {
        success: true,
        assessmentId: doctorPatientRecord.assessmentSession?.id || `assess_${Date.now()}`,
        patientId: doctorPatientRecord.id,
        doctorId: body.doctorId || "demo-doctor",
        guidanceLevel: summary?.careGuidanceLevel || doctorPatientRecord.priority,
        aiRiskScore: doctorPatientRecord.priority === "HIGH" ? 0.85 : doctorPatientRecord.priority === "MEDIUM" ? 0.55 : 0.15,
        message: summary?.riskAnalysis?.recommendation || "Your symptoms assessment has been received by your doctor portal.",
        emergencyAlert: doctorPatientRecord.priority === "HIGH" ? "Prompt clinical review advised." : undefined,
        disclaimer: "This assessment is not a diagnosis. Your doctor will review your clinical answers.",
        patientSummary: summary?.phasedAnswers?.phase0 || [],
        doctorSummary: summary?.symptoms || [],
        reasons: summary?.guidanceReasons || [],
        patientRecord: doctorPatientRecord,
        submittedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error processing mobile assessment submission:", error);
    return NextResponse.json(
      { error: "Failed to process assessment submission", details: error?.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const assessments = getStoredMobileAssessments();
  return NextResponse.json({
    service: "BreastCare AI Mobile Assessment Endpoint",
    status: "active",
    assessmentsCount: assessments.length,
    assessments,
  });
}

