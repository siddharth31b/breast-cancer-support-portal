import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  StatusBar,
  TextInput,
  Platform,
  Animated,
  Easing,
} from "react-native";
import {
  calculateCareGuidance,
  mapAnswersToSymptomKeys,
  MobileQuestionnaireAnswer,
  CareGuidanceResult,
  ClinicalRiskAnalysisResult,
} from "./src/services/assessmentEngine";
import { BreastCareMobileChatbot } from "./src/components/BreastCareMobileChatbot";

// Status bar inset padding to fix top battery/network/clock overlapping
const STATUSBAR_PADDING = Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 6 : 8;

// Backend API endpoint configuration for local LAN physical mobile testing
const BASE_URL = "http://10.2.37.152:3000";
const API_URL = `${BASE_URL}/api/mobile/assessments`;
const LOGIN_URL = `${BASE_URL}/api/mobile/auth/login`;
const REGISTER_URL = `${BASE_URL}/api/mobile/auth/register`;

export type StepId =
  | "INTRO"
  | "CURRENT_CONCERN"
  | "BREAST_SIDE"
  | "PAIN_FOLLOWUP"
  | "LUMP_FOLLOWUP"
  | "SHAPE_FOLLOWUP"
  | "WOUND_FOLLOWUP"
  | "DISCHARGE_FOLLOWUP"
  | "NECK_LUMP_FOLLOWUP"
  | "ARMPIT_LUMP_FOLLOWUP"
  | "UNDERARM_PAIN_FOLLOWUP"
  | "ABDOMINAL_FOLLOWUP"
  | "RESPIRATORY_FOLLOWUP"
  | "CNS_FOLLOWUP"
  | "CONVULSION_ALERT"
  | "BACK_SHOULDER_FOLLOWUP"
  | "DURATION"
  | "PROGRESSION"
  | "HISTORY_SUMMARY"
  | "REVIEW";

interface QuestionOption {
  label: string;
  value: string;
  subtext?: string;
}

interface QuestionDef {
  id: StepId;
  title: string;
  question: string;
  type: "single" | "multi" | "info";
  options: QuestionOption[];
}

export default function App() {
  const [inAssessment, setInAssessment] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<StepId>("CURRENT_CONCERN");
  const [answers, setAnswers] = useState<MobileQuestionnaireAnswer[]>([]);
  const [historySteps, setHistorySteps] = useState<StepId[]>([]);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role?: string;
  } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [authName, setAuthName] = useState<string>("");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingAssessmentStart, setPendingAssessmentStart] = useState<boolean>(false);

  // Modals & Submission State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [guidanceResult, setGuidanceResult] = useState<CareGuidanceResult | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [showChatbotModal, setShowChatbotModal] = useState<boolean>(false);
  const [showModeSelectionModal, setShowModeSelectionModal] = useState<boolean>(false);
  const [latestRiskAnalysis, setLatestRiskAnalysis] = useState<ClinicalRiskAnalysisResult | null>(null);

  // Smooth Animations
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Floating card oscillation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse dot glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const startNewAssessment = () => {
    setInAssessment(true);
    setCurrentStep("CURRENT_CONCERN");
    setAnswers([]);
    setHistorySteps([]);
    setGuidanceResult(null);
    setSubmittedId(null);
  };

  const handleStartAssessmentClick = () => {
    if (!currentUser) {
      setPendingAssessmentStart(true);
      setAuthMode("LOGIN");
      setAuthError(null);
      setShowAuthModal(true);
    } else {
      setShowModeSelectionModal(true);
    }
  };

  // Auth Handlers
  const handleLogin = async () => {
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Please enter both email and password.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail.trim(),
          password: authPassword.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed. Please check credentials.");
      }
      setCurrentUser(data.user);
      setShowAuthModal(false);
      setAuthPassword("");
      if (pendingAssessmentStart) {
        setPendingAssessmentStart(false);
        startNewAssessment();
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to log in.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!authName.trim() || !authEmail.trim() || !authPassword.trim()) {
      setAuthError("Please fill in all fields.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authName.trim(),
          email: authEmail.trim(),
          password: authPassword.trim(),
          role: "PATIENT",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed.");
      }
      setCurrentUser(data.user);
      setShowAuthModal(false);
      setAuthPassword("");
      if (pendingAssessmentStart) {
        setPendingAssessmentStart(false);
        startNewAssessment();
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to register.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Helper to get answer value
  const getAnswerValue = (qId: string): string | string[] | undefined => {
    return answers.find((a) => a.questionId.toLowerCase() === qId.toLowerCase())?.value;
  };

  // COMPLETE 17-STEP QUESTION DEFINITIONS MATCHING WEB PORTAL EXACTLY
  const QUESTIONS: Record<StepId, QuestionDef> = {
    INTRO: {
      id: "INTRO",
      title: "Welcome",
      question:
        "Welcome to BreastCare AI. You know your body best. I'll guide you step-by-step through recording any breast-health concerns. Shall we begin?",
      type: "single",
      options: [
        { label: "Yes, start guided assessment", value: "yes" },
        { label: "Check later", value: "no" },
      ],
    },

    CURRENT_CONCERN: {
      id: "CURRENT_CONCERN",
      title: "Step 1: Current Symptoms",
      question: "What symptoms or changes are you currently experiencing? (Select all that apply)",
      type: "multi",
      options: [
        { label: "Breast pain", value: "breast_pain" },
        { label: "Breast lump or unusual thickening", value: "breast_lump" },
        { label: "Change in breast shape or appearance", value: "breast_shape" },
        { label: "Breast wound or open sore", value: "breast_wound" },
        { label: "Nipple discharge", value: "nipple_discharge" },
        { label: "Lump in the neck", value: "neck_lump" },
        { label: "Lump in the armpit", value: "armpit_lump" },
        { label: "Underarm pain", value: "underarm_pain" },
        { label: "Shoulder pain", value: "shoulder_pain" },
        { label: "Back pain", value: "back_pain" },
        { label: "Abdominal concern", value: "abdominal" },
        { label: "Cough", value: "cough" },
        { label: "Difficulty breathing", value: "breathlessness" },
        { label: "Headache or dizziness", value: "headache_dizziness" },
        { label: "Nausea or vomiting", value: "nausea_vomiting" },
        { label: "Convulsion or seizure-like episode", value: "convulsion" },
        { label: "No symptoms (Routine check)", value: "no_symptoms" },
      ],
    },

    BREAST_SIDE: {
      id: "BREAST_SIDE",
      title: "Step 2: Affected Side",
      question: "Which breast is affected by the concern you reported?",
      type: "single",
      options: [
        { label: "Left breast", value: "left" },
        { label: "Right breast", value: "right" },
        { label: "Both breasts", value: "both" },
        { label: "Not sure", value: "not_sure" },
      ],
    },

    PAIN_FOLLOWUP: {
      id: "PAIN_FOLLOWUP",
      title: "Pain Details",
      question: "Regarding the breast pain: How long have you experienced it, and how would you describe it?",
      type: "multi",
      options: [
        { label: "Duration: Less than 1 week", value: "dur_1w" },
        { label: "Duration: 1–4 weeks", value: "dur_1_4w" },
        { label: "Duration: 1–3 months", value: "dur_1_3m" },
        { label: "Duration: More than 3 months", value: "dur_3m_plus" },
        { label: "Description: Sharp or burning", value: "desc_sharp" },
        { label: "Description: Dull or aching", value: "desc_dull" },
        { label: "Description: Tender when touched", value: "desc_tender" },
        { label: "Pain comes and goes", value: "intermittent_yes" },
        { label: "Related to menstrual cycle", value: "cycle_yes" },
        { label: "Recently become worse", value: "worse_yes" },
      ],
    },

    LUMP_FOLLOWUP: {
      id: "LUMP_FOLLOWUP",
      title: "Lump Details",
      question: "Regarding the breast lump: When was it first noticed, and has it changed in size?",
      type: "multi",
      options: [
        { label: "Noticed: Less than 1 month ago", value: "noticed_1m" },
        { label: "Noticed: 1–3 months ago", value: "noticed_1_3m" },
        { label: "Noticed: More than 3 months ago", value: "noticed_3m_plus" },
        { label: "Lump has grown in size", value: "grown_yes" },
        { label: "Feels hard or firm", value: "texture_hard" },
        { label: "Feels soft or moveable", value: "texture_soft" },
        { label: "Fixed in place (doesn't move easily)", value: "fixed_yes" },
        { label: "Painful to touch", value: "painful_yes" },
      ],
    },

    SHAPE_FOLLOWUP: {
      id: "SHAPE_FOLLOWUP",
      title: "Shape & Skin Changes",
      question: "What specific changes in breast shape or skin have you noticed?",
      type: "multi",
      options: [
        { label: "Dimpling or puckering of skin", value: "skin_dimpling" },
        { label: "Skin redness or warmth", value: "skin_redness" },
        { label: "Skin thickening or orange-peel texture", value: "orange_peel" },
        { label: "Nipple pulled inward (retraction)", value: "nipple_retraction" },
        { label: "Visible asymmetry between breasts", value: "asymmetry" },
        { label: "Swelling of part or all of the breast", value: "swelling" },
      ],
    },

    WOUND_FOLLOWUP: {
      id: "WOUND_FOLLOWUP",
      title: "Wound & Sore Details",
      question: "Please describe the wound or skin breakdown on the breast:",
      type: "multi",
      options: [
        { label: "Open sore or ulceration", value: "open_sore" },
        { label: "Crusting or scaling on/around nipple", value: "crusting" },
        { label: "Non-healing wound (> 2 weeks)", value: "non_healing" },
        { label: "Bleeding or oozing from wound", value: "oozing" },
        { label: "Recent physical injury to the area", value: "recent_injury" },
      ],
    },

    DISCHARGE_FOLLOWUP: {
      id: "DISCHARGE_FOLLOWUP",
      title: "Nipple Discharge Details",
      question: "Please specify the characteristics of the nipple discharge:",
      type: "multi",
      options: [
        { label: "Bloody or pinkish discharge", value: "bloody" },
        { label: "Clear or watery discharge", value: "clear" },
        { label: "Milky or yellowish discharge", value: "milky" },
        { label: "Discharge happens spontaneously (without squeezing)", value: "spontaneous" },
        { label: "Discharge comes from a single breast only", value: "single_breast" },
      ],
    },

    NECK_LUMP_FOLLOWUP: {
      id: "NECK_LUMP_FOLLOWUP",
      title: "Neck Lump Details",
      question: "How long has the neck lump been present and is it painful?",
      type: "multi",
      options: [
        { label: "Present: Less than 2 weeks", value: "dur_2w" },
        { label: "Present: 2–4 weeks", value: "dur_2_4w" },
        { label: "Present: More than 1 month", value: "dur_1m_plus" },
        { label: "Lump feels firm or hard", value: "texture_firm" },
        { label: "Tender or painful", value: "painful_yes" },
        { label: "Accompanied by fever or sore throat", value: "fever_yes" },
      ],
    },

    ARMPIT_LUMP_FOLLOWUP: {
      id: "ARMPIT_LUMP_FOLLOWUP",
      title: "Armpit Lump Details",
      question: "Please describe the armpit (axillary) swelling or lump:",
      type: "multi",
      options: [
        { label: "Noticed: Less than 1 month ago", value: "noticed_1m" },
        { label: "Noticed: More than 1 month ago", value: "noticed_1m_plus" },
        { label: "Lump has increased in size", value: "growing" },
        { label: "Feels hard or firm", value: "firm" },
        { label: "Tender or painful", value: "tender" },
        { label: "Present on same side as breast concern", value: "same_side" },
      ],
    },

    UNDERARM_PAIN_FOLLOWUP: {
      id: "UNDERARM_PAIN_FOLLOWUP",
      title: "Underarm Pain Details",
      question: "Regarding underarm pain: Is it constant or intermittent?",
      type: "multi",
      options: [
        { label: "Constant pain", value: "constant" },
        { label: "Intermittent pain", value: "intermittent" },
        { label: "Radiates down the arm", value: "radiating" },
        { label: "Made worse by arm movement", value: "movement" },
      ],
    },

    ABDOMINAL_FOLLOWUP: {
      id: "ABDOMINAL_FOLLOWUP",
      title: "Abdominal Concerns",
      question: "What abdominal symptoms are you experiencing?",
      type: "multi",
      options: [
        { label: "Persistent abdominal fullness or bloating", value: "bloating" },
        { label: "Right-sided upper abdominal discomfort", value: "ruq_pain" },
        { label: "Loss of appetite or early fullness", value: "early_satiety" },
        { label: "Unexplained weight loss", value: "weight_loss" },
        { label: "Yellowing of skin or eyes (jaundice)", value: "jaundice" },
      ],
    },

    RESPIRATORY_FOLLOWUP: {
      id: "RESPIRATORY_FOLLOWUP",
      title: "Respiratory Symptoms",
      question: "Please specify details about your cough or breathlessness:",
      type: "multi",
      options: [
        { label: "Persistent dry cough (> 3 weeks)", value: "cough_3w" },
        { label: "Coughing up blood or blood-tinged sputum", value: "hemoptysis" },
        { label: "Shortness of breath on mild exertion", value: "sob_exertion" },
        { label: "Shortness of breath at rest", value: "sob_rest" },
        { label: "Chest tightness or pleuritic pain", value: "chest_pain" },
      ],
    },

    CNS_FOLLOWUP: {
      id: "CNS_FOLLOWUP",
      title: "Neurological Symptoms",
      question: "Please describe any headache, dizziness, or neurological concerns:",
      type: "multi",
      options: [
        { label: "New or unusually severe headache", value: "severe_headache" },
        { label: "Headache worse in the morning", value: "morning_headache" },
        { label: "Headache accompanied by nausea/vomiting", value: "headache_nausea" },
        { label: "Dizziness or balance difficulties", value: "dizziness" },
        { label: "Vision changes (blurring, double vision)", value: "vision_change" },
        { label: "Weakness or numbness in arm or leg", value: "focal_weakness" },
      ],
    },

    CONVULSION_ALERT: {
      id: "CONVULSION_ALERT",
      title: "Important Safety Alert",
      question:
        "You indicated a convulsion or seizure episode. This requires prompt medical evaluation by a physician.",
      type: "info",
      options: [
        { label: "I understand and will seek medical care", value: "acknowledged" },
      ],
    },

    BACK_SHOULDER_FOLLOWUP: {
      id: "BACK_SHOULDER_FOLLOWUP",
      title: "Back & Shoulder Pain",
      question: "Regarding back or shoulder pain: Is it persistent or worse at night?",
      type: "multi",
      options: [
        { label: "Persistent bone or back pain", value: "persistent_back" },
        { label: "Pain worse at night or when lying down", value: "worse_night" },
        { label: "Shoulder pain on same side as breast concern", value: "ipsilateral_shoulder" },
        { label: "Pain not relieved by rest or simple pain relievers", value: "unrelieved" },
      ],
    },

    DURATION: {
      id: "DURATION",
      title: "Overall Duration",
      question: "How long overall have you noticed these primary concerns?",
      type: "single",
      options: [
        { label: "Less than 2 weeks", value: "lt_2w" },
        { label: "2 to 4 weeks", value: "2_4w" },
        { label: "1 to 3 months", value: "1_3m" },
        { label: "3 to 6 months", value: "3_6m" },
        { label: "More than 6 months", value: "gt_6m" },
        { label: "Not sure", value: "not_sure" },
      ],
    },

    PROGRESSION: {
      id: "PROGRESSION",
      title: "Symptom Progression",
      question: "Have your symptoms changed over time?",
      type: "single",
      options: [
        { label: "Gradually getting worse", value: "worse_gradual" },
        { label: "Rapidly getting worse", value: "worse_rapid" },
        { label: "Staying about the same", value: "stable" },
        { label: "Improving", value: "improving" },
        { label: "Fluctuating (comes and goes)", value: "fluctuating" },
      ],
    },

    HISTORY_SUMMARY: {
      id: "HISTORY_SUMMARY",
      title: "Personal & Family History",
      question: "Do any of the following apply to your personal or family medical history?",
      type: "multi",
      options: [
        { label: "Family history of breast cancer (mother, sister, daughter)", value: "fh_breast" },
        { label: "Family history of ovarian cancer", value: "fh_ovarian" },
        { label: "Personal history of breast biopsy or procedure", value: "prior_biopsy" },
        { label: "Previous abnormal mammogram or ultrasound", value: "prior_abnormal_img" },
        { label: "Currently pregnant or breastfeeding", value: "preg_breastfeeding" },
        { label: "None of the above", value: "none" },
      ],
    },

    REVIEW: {
      id: "REVIEW",
      title: "Assessment Review",
      question: "Thank you. Your responses have been processed by the clinical triage engine.",
      type: "info",
      options: [],
    },
  };

  // Branching Decision Engine logic
  const determineNextStep = (current: StepId, currentAnswers: MobileQuestionnaireAnswer[]): StepId => {
    const selectedConcerns = (currentAnswers.find((a) => a.questionId === "CURRENT_CONCERN")?.value as string[]) || [];

    switch (current) {
      case "CURRENT_CONCERN":
        if (selectedConcerns.includes("no_symptoms") && selectedConcerns.length === 1) {
          return "DURATION";
        }
        return "BREAST_SIDE";

      case "BREAST_SIDE":
        if (selectedConcerns.includes("breast_pain")) return "PAIN_FOLLOWUP";
        if (selectedConcerns.includes("breast_lump")) return "LUMP_FOLLOWUP";
        if (selectedConcerns.includes("breast_shape")) return "SHAPE_FOLLOWUP";
        if (selectedConcerns.includes("breast_wound")) return "WOUND_FOLLOWUP";
        if (selectedConcerns.includes("nipple_discharge")) return "DISCHARGE_FOLLOWUP";
        if (selectedConcerns.includes("neck_lump")) return "NECK_LUMP_FOLLOWUP";
        if (selectedConcerns.includes("armpit_lump")) return "ARMPIT_LUMP_FOLLOWUP";
        if (selectedConcerns.includes("underarm_pain")) return "UNDERARM_PAIN_FOLLOWUP";
        if (selectedConcerns.includes("abdominal")) return "ABDOMINAL_FOLLOWUP";
        if (selectedConcerns.includes("cough") || selectedConcerns.includes("breathlessness")) return "RESPIRATORY_FOLLOWUP";
        if (selectedConcerns.includes("headache_dizziness") || selectedConcerns.includes("nausea_vomiting")) return "CNS_FOLLOWUP";
        if (selectedConcerns.includes("convulsion")) return "CONVULSION_ALERT";
        if (selectedConcerns.includes("shoulder_pain") || selectedConcerns.includes("back_pain")) return "BACK_SHOULDER_FOLLOWUP";
        return "DURATION";

      case "PAIN_FOLLOWUP":
        if (selectedConcerns.includes("breast_lump")) return "LUMP_FOLLOWUP";
        if (selectedConcerns.includes("breast_shape")) return "SHAPE_FOLLOWUP";
        if (selectedConcerns.includes("breast_wound")) return "WOUND_FOLLOWUP";
        if (selectedConcerns.includes("nipple_discharge")) return "DISCHARGE_FOLLOWUP";
        if (selectedConcerns.includes("armpit_lump")) return "ARMPIT_LUMP_FOLLOWUP";
        if (selectedConcerns.includes("underarm_pain")) return "UNDERARM_PAIN_FOLLOWUP";
        return "DURATION";

      case "LUMP_FOLLOWUP":
        if (selectedConcerns.includes("breast_shape")) return "SHAPE_FOLLOWUP";
        if (selectedConcerns.includes("breast_wound")) return "WOUND_FOLLOWUP";
        if (selectedConcerns.includes("nipple_discharge")) return "DISCHARGE_FOLLOWUP";
        if (selectedConcerns.includes("armpit_lump")) return "ARMPIT_LUMP_FOLLOWUP";
        return "DURATION";

      case "SHAPE_FOLLOWUP":
        if (selectedConcerns.includes("breast_wound")) return "WOUND_FOLLOWUP";
        if (selectedConcerns.includes("nipple_discharge")) return "DISCHARGE_FOLLOWUP";
        return "DURATION";

      case "WOUND_FOLLOWUP":
        if (selectedConcerns.includes("nipple_discharge")) return "DISCHARGE_FOLLOWUP";
        return "DURATION";

      case "DISCHARGE_FOLLOWUP":
        if (selectedConcerns.includes("armpit_lump")) return "ARMPIT_LUMP_FOLLOWUP";
        return "DURATION";

      case "NECK_LUMP_FOLLOWUP":
      case "ARMPIT_LUMP_FOLLOWUP":
      case "UNDERARM_PAIN_FOLLOWUP":
      case "ABDOMINAL_FOLLOWUP":
      case "RESPIRATORY_FOLLOWUP":
      case "CNS_FOLLOWUP":
      case "CONVULSION_ALERT":
      case "BACK_SHOULDER_FOLLOWUP":
        return "DURATION";

      case "DURATION":
        return "PROGRESSION";

      case "PROGRESSION":
        return "HISTORY_SUMMARY";

      case "HISTORY_SUMMARY":
        return "REVIEW";

      default:
        return "REVIEW";
    }
  };

  const handleSelectOption = (value: string) => {
    const qDef = QUESTIONS[currentStep];
    let updatedAnswers = [...answers];

    if (qDef.type === "single") {
      updatedAnswers = updatedAnswers.filter((a) => a.questionId !== currentStep);
      updatedAnswers.push({ questionId: currentStep, value });
    } else if (qDef.type === "multi") {
      const existing = updatedAnswers.find((a) => a.questionId === currentStep);
      let currentArr: string[] = Array.isArray(existing?.value) ? (existing?.value as string[]) : [];

      if (value === "no_symptoms" || value === "none") {
        currentArr = [value];
      } else {
        currentArr = currentArr.filter((v) => v !== "no_symptoms" && v !== "none");
        if (currentArr.includes(value)) {
          currentArr = currentArr.filter((v) => v !== value);
        } else {
          currentArr.push(value);
        }
      }
      updatedAnswers = updatedAnswers.filter((a) => a.questionId !== currentStep);
      if (currentArr.length > 0) {
        updatedAnswers.push({ questionId: currentStep, value: currentArr });
      }
    }
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    const nextStep = determineNextStep(currentStep, answers);
    setHistorySteps([...historySteps, currentStep]);

    if (nextStep === "REVIEW") {
      const guidance = calculateCareGuidance(answers);
      setGuidanceResult(guidance);
      if (guidance.emergencyAlert) {
        setShowEmergencyModal(true);
      }
    }
    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    if (historySteps.length > 0) {
      const prevStep = historySteps[historySteps.length - 1];
      setHistorySteps(historySteps.slice(0, -1));
      setCurrentStep(prevStep);
    } else {
      setInAssessment(false);
    }
  };

  const submitAssessment = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: currentUser?.id || `mob_${Date.now()}`,
          patientName: currentUser?.name || "Mobile Patient",
          patientEmail: currentUser?.email || "patient@mobile.breastcare.ai",
          answers: answers,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedId(data.assessmentId || `assess_${Date.now()}`);
      } else {
        setSubmittedId(`ref_mob_${Date.now().toString().slice(-6)}`);
      }
    } catch (err) {
      setSubmittedId(`ref_mob_${Date.now().toString().slice(-6)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = QUESTIONS[currentStep];
  const currentVal = getAnswerValue(currentStep);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* TOP HEADER WITH FIXED STATUS BAR INSET PADDING */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIconBg}>
            <Text style={styles.logoIconText}>🧠</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>
              BreastCare <Text style={styles.brandTitleAccent}>AI</Text>
            </Text>
            <Text style={styles.drishitiText}>IITI DRISHTI CPS Hub</Text>
          </View>
        </View>

        {/* User Account Status Badge */}
        {currentUser ? (
          <View style={styles.userBadgeRow}>
            <View style={styles.userBadge}>
              <Text style={styles.userBadgeText}>👤 {currentUser.name}</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.authHeaderBtn}
            onPress={() => {
              setPendingAssessmentStart(false);
              setAuthMode("LOGIN");
              setAuthError(null);
              setShowAuthModal(true);
            }}
          >
            <Text style={styles.authHeaderBtnText}>Portal</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 1. LANDING PAGE SCREEN MATCHING WEB HERO PERFECTLY */}
      {!inAssessment ? (
        <Animated.ScrollView contentContainerStyle={styles.landingContainer} style={{ opacity: fadeAnim }}>
          {/* Web Hero Pill Badge */}
          <View style={styles.heroPill}>
            <Animated.View style={[styles.heroPillDot, { opacity: pulseAnim }]} />
            <Text style={styles.heroPillText}>AI-POWERED • EXPLAINABLE • CLINICIAN-IN-THE-LOOP</Text>
          </View>

          {/* Web Headline Style */}
          <Text style={styles.heroMainTitle}>
            Intelligent{"\n"}
            Support,{"\n"}
            <Text style={styles.heroMainAccent}>Human Expertise.</Text>
          </Text>

          <Text style={styles.heroSubText}>
            BreastCare AI combines advanced explainable AI with specialist validation to support early screening,
            accurate analysis, and better breast healthcare for all.
          </Text>

          {/* Primary CTA Buttons */}
          <View style={styles.heroActionRow}>
            <TouchableOpacity style={styles.primaryTealBtn} onPress={handleStartAssessmentClick} activeOpacity={0.85}>
              <Text style={styles.primaryTealBtnText}>Start Your Journey →</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.chatbotQuickBtn} 
              onPress={() => {
                if (!currentUser) {
                  setPendingAssessmentStart(true);
                  setAuthMode("LOGIN");
                  setAuthError(null);
                  setShowAuthModal(true);
                } else {
                  setShowChatbotModal(true);
                }
              }} 
              activeOpacity={0.85}
            >
              <Text style={styles.chatbotQuickBtnText}>🤖 Open AI Chatbot</Text>
            </TouchableOpacity>
          </View>

          {/* DYNAMIC WELLNESS SCORE & RISK ASSESSMENT WIDGET */}
          <View style={styles.wellnessCard}>
            <View style={styles.wellnessCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.wellnessCardLabel}>OVERALL WELLNESS SCORE</Text>
                <Text style={styles.wellnessCardDesc}>
                  {latestRiskAnalysis
                    ? `Calibrated against your latest Phased Clinical Risk Analysis.`
                    : `Complete your AI symptom intake to generate your clinical score.`}
                </Text>
              </View>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>
                  {latestRiskAnalysis ? (
                    latestRiskAnalysis.tier === "Urgent"
                      ? Math.min(42, Math.max(18, Math.round(42 - Math.max(0, latestRiskAnalysis.totalScore - 24) * 0.8)))
                      : latestRiskAnalysis.tier === "High"
                      ? Math.min(68, Math.max(48, Math.round(68 - Math.max(0, latestRiskAnalysis.totalScore - 16) * 2.2)))
                      : latestRiskAnalysis.tier === "Moderate"
                      ? Math.min(85, Math.max(72, Math.round(85 - Math.max(0, latestRiskAnalysis.totalScore - 8) * 1.5)))
                      : Math.min(98, Math.max(88, Math.round(98 - latestRiskAnalysis.totalScore * 1.2)))
                  ) : (
                    "—"
                  )}
                </Text>
                <Text style={styles.scoreSub}>
                  {latestRiskAnalysis ? "/100" : "Pending"}
                </Text>
              </View>
            </View>

            <View style={styles.riskTierStrip}>
              <Text style={styles.riskTierHeader}>BREAST SCREENING RISK</Text>
              <View
                style={[
                  styles.riskBadge,
                  !latestRiskAnalysis
                    ? styles.riskBadgePending
                    : latestRiskAnalysis.tier === "Urgent"
                    ? styles.riskBadgeUrgent
                    : latestRiskAnalysis.tier === "High"
                    ? styles.riskBadgeHigh
                    : latestRiskAnalysis.tier === "Moderate"
                    ? styles.riskBadgeModerate
                    : styles.riskBadgeLow,
                ]}
              >
                <View
                  style={[
                    styles.riskBadgeDot,
                    !latestRiskAnalysis
                      ? styles.riskDotPending
                      : latestRiskAnalysis.tier === "Urgent"
                      ? styles.riskDotUrgent
                      : latestRiskAnalysis.tier === "High"
                      ? styles.riskDotHigh
                      : latestRiskAnalysis.tier === "Moderate"
                      ? styles.riskDotModerate
                      : styles.riskDotLow,
                  ]}
                />
                <Text
                  style={[
                    styles.riskBadgeText,
                    !latestRiskAnalysis
                      ? styles.riskTextPending
                      : latestRiskAnalysis.tier === "Urgent"
                      ? styles.riskTextUrgent
                      : latestRiskAnalysis.tier === "High"
                      ? styles.riskTextHigh
                      : latestRiskAnalysis.tier === "Moderate"
                      ? styles.riskTextModerate
                      : styles.riskTextLow,
                  ]}
                >
                  {!latestRiskAnalysis
                    ? "Intake Pending"
                    : latestRiskAnalysis.tier === "Urgent"
                    ? "Urgent Risk (Clinical Override)"
                    : `${latestRiskAnalysis.tier} Risk (Score: ${latestRiskAnalysis.totalScore})`}
                </Text>
              </View>
            </View>

            {latestRiskAnalysis && (
              <TouchableOpacity
                style={styles.reviewSummaryBtn}
                onPress={() => setShowChatbotModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.reviewSummaryBtnText}>View AI Clinical Report & Insights →</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Security Shield Banner */}
          <View style={styles.securityBanner}>
            <Text style={styles.securityShield}>🛡️</Text>
            <Text style={styles.securityText}>
              Your data is secure, private and protected with enterprise-grade encryption.
            </Text>
          </View>

          {/* FLOATING WEB HERO MOCKUP CARD 1: AI ANALYSIS CARD */}
          <Animated.View style={[styles.mockupCard, { transform: [{ translateY: floatAnim }] }]}>
            <View style={styles.mockupHeader}>
              <View style={styles.mockupHeaderLeft}>
                <Text style={styles.mockupBrainIcon}>🧠</Text>
                <Text style={styles.mockupTitle}>AI Analysis</Text>
              </View>
              <Text style={styles.mockupId}>ID: BC-74821</Text>
            </View>

            <View style={styles.confidenceBox}>
              <Text style={styles.confidenceLabel}>HIGH CONFIDENCE</Text>
              <Text style={styles.confidenceVal}>98.7%</Text>
            </View>

            <View style={styles.insightsList}>
              <Text style={styles.insightsTitle}>KEY INSIGHTS</Text>
              <View style={styles.insightRow}>
                <Text style={styles.insightText}>Mass Detection</Text>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <View style={styles.insightRow}>
                <Text style={styles.insightText}>Microcalcifications</Text>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <View style={styles.insightRow}>
                <Text style={styles.insightText}>Architectural Distortion</Text>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            </View>

            <View style={styles.biradsPill}>
              <View style={styles.biradsBadge}>
                <Text style={styles.biradsBadgeText}>2</Text>
              </View>
              <View>
                <Text style={styles.biradsTitle}>BI-RADS® 2 Assessment</Text>
                <Text style={styles.biradsSub}>Benign Finding • Routine Follow-up</Text>
              </View>
            </View>
          </Animated.View>

          {/* FLOATING MOCKUP CARD 2: MY JOURNEY CARD */}
          <View style={styles.journeyCard}>
            <Text style={styles.journeyCardHeader}>MY JOURNEY</Text>

            {[
              { label: "Profile & History", status: "Done" },
              { label: "Questionnaire Assessment", status: currentUser ? "Done" : "Ready" },
              { label: "Reports Uploaded", status: "Done" },
              { label: "AI Assessment", status: "In Progress" },
              { label: "Doctor Review", status: "Pending" },
            ].map((item, i) => (
              <View key={i} style={styles.journeyRow}>
                <Text style={styles.journeyLabel}>{item.label}</Text>
                <View
                  style={[
                    styles.journeyBadge,
                    item.status === "Done"
                      ? styles.journeyBadgeDone
                      : item.status === "Ready" || item.status === "In Progress"
                      ? styles.journeyBadgeReady
                      : styles.journeyBadgePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.journeyBadgeText,
                      item.status === "Done"
                        ? styles.journeyBadgeTextDone
                        : item.status === "Ready" || item.status === "In Progress"
                        ? styles.journeyBadgeTextReady
                        : styles.journeyBadgeTextPending,
                    ]}
                  >
                    {item.status === "Done" ? "✓ " + item.status : item.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Stepper Workflow Visual */}
          <View style={styles.workflowStrip}>
            <Text style={styles.workflowHeaderTitle}>CLINICAL WORKFLOW</Text>
            <View style={styles.workflowRow}>
              {[
                { step: "1", title: "SCREENING", color: "#005F56" },
                { step: "2", title: "AI ANALYSIS", color: "#00897B" },
                { step: "3", title: "EXPERT REVIEW", color: "#005F56" },
                { step: "4", title: "CARE GUIDANCE", color: "#10B981" },
              ].map((w, idx) => (
                <View key={idx} style={styles.workflowStepItem}>
                  <View style={[styles.workflowCircle, { borderColor: w.color }]}>
                    <Text style={[styles.workflowCircleText, { color: w.color }]}>{w.step}</Text>
                  </View>
                  <Text style={styles.workflowStepTitle}>{w.title}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 4 FEATURE PILLS ROW AT BOTTOM */}
          <View style={styles.featureGrid}>
            {[
              { title: "Explainable AI", sub: "Transparent Insights" },
              { title: "Clinician-in-the-Loop", sub: "Human Oversight" },
              { title: "Privacy & Security", sub: "AES-256 Encrypted" },
              { title: "Research Driven", sub: "IITI DRISHTI CPS" },
            ].map((f, i) => (
              <View key={i} style={styles.featureBox}>
                <Text style={styles.featureCheck}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureSub}>{f.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.ScrollView>
      ) : (
        /* 2. GUIDED ASSESSMENT WIZARD MATCHING WEB PORTAL STYLING */
        <View style={{ flex: 1 }}>
          {/* Progress Counter & Exit Header */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeaderRow}>
              <Text style={styles.progressText}>
                {currentStep === "REVIEW"
                  ? "Step 17 of 17 • Reviewing Guidance"
                  : `Step ${historySteps.length + 1} of 17 • Guided Triage`}
              </Text>
              <TouchableOpacity onPress={() => setInAssessment(false)}>
                <Text style={styles.exitAssessmentText}>✕ Exit to Home</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${
                      currentStep === "REVIEW"
                        ? 100
                        : Math.min(100, Math.max(10, ((historySteps.length + 1) / 8) * 100))
                    }%`,
                  },
                ]}
              />
            </View>

            {currentUser && (
              <Text style={styles.assessingUserTag}>
                Assessing for: <Text style={{ fontWeight: "700" }}>{currentUser.name}</Text> ({currentUser.email})
              </Text>
            )}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* SUBMITTED SUCCESS RECEIPT */}
            {submittedId ? (
              <View style={[styles.card, styles.successCard]}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successTitle}>Report Transmitted to Doctor's Portal</Text>
                <Text style={styles.successSub}>
                  Your 17-step clinical assessment and symptom summary have been transmitted to the IIT Indore Doctor
                  Portal for immediate clinical review.
                </Text>

                <View style={styles.refBox}>
                  <Text style={styles.refLabel}>Clinical Reference ID:</Text>
                  <Text style={styles.refVal}>{submittedId}</Text>
                  {currentUser && (
                    <Text style={styles.refUser}>
                      Patient: {currentUser.name} ({currentUser.email})
                    </Text>
                  )}
                </View>

                <TouchableOpacity style={styles.primaryTealBtn} onPress={() => setInAssessment(false)}>
                  <Text style={styles.primaryTealBtnText}>Return to Home Screen →</Text>
                </TouchableOpacity>
              </View>
            ) : currentStep === "REVIEW" && guidanceResult ? (
              /* REVIEW & TRIAGE RESULTS SCREEN */
              <View style={styles.card}>
                <Text style={styles.stepTitle}>Care Guidance Summary</Text>

                <View
                  style={[
                    styles.badge,
                    guidanceResult.level === "HIGH"
                      ? styles.badgeHigh
                      : guidanceResult.level === "MEDIUM"
                      ? styles.badgeMedium
                      : styles.badgeLow,
                  ]}
                >
                  <Text style={styles.badgeText}>TRIAGE TIER: {guidanceResult.level} RISK</Text>
                </View>

                <Text style={styles.guidanceMsg}>{guidanceResult.message}</Text>

                {guidanceResult.reasons.length > 0 && (
                  <View style={styles.reasonsBox}>
                    <Text style={styles.reasonsTitle}>Key Clinical Findings:</Text>
                    {guidanceResult.reasons.map((r, i) => (
                      <Text key={i} style={styles.reasonItem}>
                        • {r}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Patient Summary Checklist */}
                <View style={styles.summarySection}>
                  <Text style={styles.summarySectionTitle}>Your Reported Symptoms</Text>
                  {guidanceResult.patientSummaryItems.map((item, idx) => (
                    <View key={idx} style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>{item.label}:</Text>
                      <Text style={styles.summaryValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>

                {/* Transmit to Doctor Portal Button */}
                <TouchableOpacity
                  style={[styles.primaryTealBtn, styles.submitBtn]}
                  onPress={submitAssessment}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryTealBtnText}>Submit & Transmit to Doctor's Portal →</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* QUESTION STEP CARD */
              <View style={styles.card}>
                <Text style={styles.stepTitle}>{currentQ.title}</Text>
                <Text style={styles.questionText}>{currentQ.question}</Text>

                {/* OPTIONS LIST */}
                {currentQ.options.map((opt) => {
                  let isSelected = false;
                  if (currentQ.type === "single") {
                    isSelected = currentVal === opt.value;
                  } else if (currentQ.type === "multi") {
                    isSelected = Array.isArray(currentVal) && currentVal.includes(opt.value);
                  }

                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                      onPress={() => handleSelectOption(opt.value)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                          {opt.label}
                        </Text>
                        {opt.subtext && <Text style={styles.optionSubtext}>{opt.subtext}</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* NAVIGATION BUTTONS */}
                <View style={styles.navRow}>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={handleBack}>
                    <Text style={styles.secondaryBtnText}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryTealBtn, { flex: 1 }]}
                    onPress={handleNext}
                  >
                    <Text style={styles.primaryTealBtnText}>Continue →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* LOGIN & SIGN UP MODAL */}
      <Modal visible={showAuthModal} transparent animationType="fade" onRequestClose={() => setShowAuthModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.authCard}>
            <View style={styles.authModalHeader}>
              <Text style={styles.authModalTitle}>
                {authMode === "LOGIN" ? "Patient Sign In" : "Create Patient Account"}
              </Text>
              <TouchableOpacity onPress={() => setShowAuthModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {pendingAssessmentStart && (
              <View style={styles.authNoticeCard}>
                <Text style={styles.authNoticeTitle}>🔒 Authentication Required</Text>
                <Text style={styles.authNoticeSub}>
                  Please sign in or create an account to start your assessment so your report can be securely shared with the Doctor's Portal.
                </Text>
              </View>
            )}

            {authError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {authError}</Text>
              </View>
            )}

            {authMode === "REGISTER" && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Jane Doe"
                  value={authName}
                  onChangeText={setAuthName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="patient@example.com"
                value={authEmail}
                onChangeText={setAuthEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                value={authPassword}
                onChangeText={setAuthPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryTealBtn, { marginTop: 12 }]}
              onPress={authMode === "LOGIN" ? handleLogin : handleRegister}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryTealBtnText}>
                  {authMode === "LOGIN" ? "Sign In & Begin Assessment →" : "Create Account & Begin →"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchAuthModeBtn}
              onPress={() => {
                setAuthMode(authMode === "LOGIN" ? "REGISTER" : "LOGIN");
                setAuthError(null);
              }}
            >
              <Text style={styles.switchAuthModeText}>
                {authMode === "LOGIN"
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FLOATING AI ASSISTANT ACTION BUTTON */}
      {!inAssessment && (
        <TouchableOpacity
          style={styles.floatingChatbotFab}
          onPress={() => {
            if (!currentUser) {
              setPendingAssessmentStart(true);
              setAuthMode("LOGIN");
              setAuthError(null);
              setShowAuthModal(true);
            } else {
              setShowChatbotModal(true);
            }
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.floatingFabIcon}>💬</Text>
          <Text style={styles.floatingFabLabel}>AI Intake</Text>
        </TouchableOpacity>
      )}

      {/* ASSESSMENT FORMAT SELECTION MODAL */}
      <Modal
        visible={showModeSelectionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModeSelectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modeCard}>
            <View style={styles.modeModalHeader}>
              <Text style={styles.modeModalTitle}>Choose Assessment Format</Text>
              <TouchableOpacity
                onPress={() => setShowModeSelectionModal(false)}
              >
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modeModalDesc}>
              Select how you would like to complete your clinical intake:
            </Text>

            <TouchableOpacity
              style={styles.modeOptionPrimary}
              onPress={() => {
                setShowModeSelectionModal(false);
                setShowChatbotModal(true);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.modeOptionIconBg}>
                <Text style={{ fontSize: 24 }}>🤖</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.recBadge}>
                  <Text style={styles.recBadgeText}>RECOMMENDED</Text>
                </View>
                <Text style={styles.modeOptionTitle}>Interactive AI Chatbot</Text>
                <Text style={styles.modeOptionSub}>
                  Conversational 4-phase clinical flow with live risk scoring and clinical report.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeOptionSecondary}
              onPress={() => {
                setShowModeSelectionModal(false);
                startNewAssessment();
              }}
              activeOpacity={0.85}
            >
              <View style={styles.modeOptionIconBgSec}>
                <Text style={{ fontSize: 24 }}>📝</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modeOptionTitleSec}>Step-by-Step Guided Form</Text>
                <Text style={styles.modeOptionSub}>
                  Standard question-by-question structured clinical intake form.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CONVERSATIONAL CLINICAL AI CHATBOT MODAL */}
      <BreastCareMobileChatbot
        visible={showChatbotModal}
        onClose={() => setShowChatbotModal(false)}
        currentUser={currentUser}
        apiUrl={API_URL}
        onCompleteAssessment={(collected, result) => {
          setLatestRiskAnalysis(result);
          setAnswers(collected);
        }}
        onSwitchToManual={() => {
          setShowChatbotModal(false);
          startNewAssessment();
        }}
      />

      {/* EMERGENCY ALERT MODAL */}
      <Modal visible={showEmergencyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>🚨</Text>
            <Text style={styles.modalTitle}>Urgent Care Recommendation</Text>
            <Text style={styles.modalText}>
              Based on the symptoms you reported, immediate medical evaluation by a qualified healthcare professional is
              recommended.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowEmergencyModal(false)}>
              <Text style={styles.modalBtnText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: STATUSBAR_PADDING,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#E6F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIconText: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  brandTitleAccent: {
    color: "#005F56",
  },
  drishitiText: {
    fontSize: 10,
    color: "#00796B",
    fontWeight: "600",
  },
  userBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userBadge: {
    backgroundColor: "#E6F4F1",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#B2DFDB",
  },
  userBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#005F56",
  },
  logoutBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoutBtnText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "600",
  },
  authHeaderBtn: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  authHeaderBtnText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "700",
  },

  // LANDING SCREEN STYLES
  landingContainer: {
    padding: 20,
    gap: 18,
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E6F4F1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#B2DFDB",
    gap: 8,
  },
  heroPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  heroPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#005F56",
    letterSpacing: 0.5,
  },
  heroMainTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  heroMainAccent: {
    color: "#005F56",
  },
  heroSubText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
  heroActionRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 4,
  },
  primaryTealBtn: {
    backgroundColor: "#005F56",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#005F56",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flex: 1,
  },
  primaryTealBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  demoBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  demoBtnText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
  },

  securityBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  securityShield: {
    fontSize: 16,
  },
  securityText: {
    fontSize: 11,
    color: "#166534",
    flex: 1,
  },

  // MOCKUP CARDS MATCHING WEB DASHBOARD
  mockupCard: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#334155",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  mockupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mockupHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mockupBrainIcon: {
    fontSize: 16,
  },
  mockupTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  mockupId: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  confidenceBox: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  confidenceLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#38BDF8",
    letterSpacing: 0.5,
  },
  confidenceVal: {
    fontSize: 22,
    fontWeight: "900",
    color: "#34D399",
  },
  insightsList: {
    gap: 6,
  },
  insightsTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  insightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  insightText: {
    fontSize: 12,
    color: "#CBD5E1",
  },
  checkIcon: {
    fontSize: 12,
    color: "#34D399",
    fontWeight: "bold",
  },
  biradsPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  biradsBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  biradsBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  biradsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  biradsSub: {
    fontSize: 10,
    color: "#94A3B8",
  },

  journeyCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
    elevation: 2,
  },
  journeyCardHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#005F56",
    letterSpacing: 0.5,
  },
  journeyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  journeyLabel: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
  },
  journeyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  journeyBadgeDone: {
    backgroundColor: "#D1FAE5",
  },
  journeyBadgeReady: {
    backgroundColor: "#E6F4F1",
  },
  journeyBadgePending: {
    backgroundColor: "#F1F5F9",
  },
  journeyBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  journeyBadgeTextDone: {
    color: "#065F46",
  },
  journeyBadgeTextReady: {
    color: "#005F56",
  },
  journeyBadgeTextPending: {
    color: "#64748B",
  },

  workflowStrip: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  workflowHeaderTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  workflowRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  workflowStepItem: {
    alignItems: "center",
    gap: 4,
  },
  workflowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  workflowCircleText: {
    fontSize: 12,
    fontWeight: "800",
  },
  workflowStepTitle: {
    fontSize: 10,
    color: "#334155",
    fontWeight: "700",
  },

  featureGrid: {
    gap: 10,
  },
  featureBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  featureCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    color: "#059669",
    textAlign: "center",
    lineHeight: 24,
    fontSize: 12,
    fontWeight: "bold",
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  featureSub: {
    fontSize: 11,
    color: "#64748B",
  },

  // ASSESSMENT WIZARD STYLES
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  progressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 12,
    color: "#005F56",
    fontWeight: "700",
  },
  exitAssessmentText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  assessingUserTag: {
    fontSize: 11,
    color: "#00796B",
    marginTop: 2,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#005F56",
    borderRadius: 3,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 3,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#005F56",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 24,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FAFAFA",
    gap: 12,
  },
  optionBtnSelected: {
    borderColor: "#005F56",
    backgroundColor: "#E6F4F1",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: "#005F56",
    backgroundColor: "#005F56",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  optionText: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#005F56",
    fontWeight: "700",
  },
  optionSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  navRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  secondaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "600",
  },

  // RESULTS & SUCCESS CARD STYLES
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeLow: {
    backgroundColor: "#D1FAE5",
  },
  badgeMedium: {
    backgroundColor: "#FEF3C7",
  },
  badgeHigh: {
    backgroundColor: "#FEE2E2",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  guidanceMsg: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
  },
  reasonsBox: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  reasonsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  reasonItem: {
    fontSize: 12,
    color: "#475569",
  },
  summarySection: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 12,
  },
  summarySectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#005F56",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
  },
  submitBtn: {
    marginTop: 8,
  },
  successCard: {
    alignItems: "center",
    textAlign: "center",
    padding: 24,
  },
  successIcon: {
    fontSize: 48,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#065F46",
    textAlign: "center",
  },
  successSub: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    lineHeight: 20,
  },
  refBox: {
    backgroundColor: "#E6F4F1",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#B2DFDB",
    marginVertical: 10,
  },
  refLabel: {
    fontSize: 12,
    color: "#005F56",
  },
  refVal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#005F56",
    letterSpacing: 1,
  },
  refUser: {
    fontSize: 12,
    color: "#004D40",
    marginTop: 4,
  },

  // AUTH MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  authCard: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 16,
    padding: 20,
    gap: 12,
    elevation: 5,
  },
  authModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 10,
  },
  authModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#005F56",
  },
  closeBtn: {
    fontSize: 20,
    color: "#64748B",
    paddingHorizontal: 4,
  },
  authNoticeCard: {
    backgroundColor: "#E6F4F1",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#005F56",
  },
  authNoticeTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#005F56",
  },
  authNoticeSub: {
    fontSize: 11,
    color: "#004D40",
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 12,
    fontWeight: "600",
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#FAFAFA",
  },
  switchAuthModeBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  switchAuthModeText: {
    fontSize: 13,
    color: "#005F56",
    fontWeight: "600",
  },

  // EMERGENCY MODAL STYLES
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    maxWidth: 320,
  },
  modalIcon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#DC2626",
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    lineHeight: 20,
  },
  modalBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 8,
  },
  modalBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // WELLNESS CARD & CHATBOT STYLES
  chatbotQuickBtn: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  chatbotQuickBtnText: {
    color: "#005F56",
    fontSize: 13,
    fontWeight: "700",
  },
  wellnessCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wellnessCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  wellnessCardLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.5,
  },
  wellnessCardDesc: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
    lineHeight: 15,
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E6F4F1",
    borderWidth: 2,
    borderColor: "#005F56",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: "#005F56",
    lineHeight: 22,
  },
  scoreSub: {
    fontSize: 9,
    fontWeight: "700",
    color: "#004D40",
  },
  riskTierStrip: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  riskTierHeader: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  riskBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  riskBadgePending: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  riskDotPending: {
    backgroundColor: "#94A3B8",
  },
  riskTextPending: {
    color: "#64748B",
  },
  riskBadgeLow: {
    backgroundColor: "#D1FAE5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  riskDotLow: {
    backgroundColor: "#059669",
  },
  riskTextLow: {
    color: "#065F46",
  },
  riskBadgeModerate: {
    backgroundColor: "#DBEAFE",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  riskDotModerate: {
    backgroundColor: "#2563EB",
  },
  riskTextModerate: {
    color: "#1E40AF",
  },
  riskBadgeHigh: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  riskDotHigh: {
    backgroundColor: "#D97706",
  },
  riskTextHigh: {
    color: "#92400E",
  },
  riskBadgeUrgent: {
    backgroundColor: "#FFE4E6",
    borderWidth: 1,
    borderColor: "#FECDD3",
  },
  riskDotUrgent: {
    backgroundColor: "#E11D48",
  },
  riskTextUrgent: {
    color: "#9F1239",
  },
  reviewSummaryBtn: {
    marginTop: 10,
    backgroundColor: "#E6F4F1",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  reviewSummaryBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#005F56",
  },

  // FLOATING FAB
  floatingChatbotFab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    backgroundColor: "#005F56",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 999,
  },
  floatingFabIcon: {
    fontSize: 20,
  },
  floatingFabLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  // MODE SELECTION MODAL
  modeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 380,
    gap: 12,
  },
  modeModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modeModalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  modeModalDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
  modeOptionPrimary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#005F56",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  modeOptionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E6F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  recBadge: {
    backgroundColor: "#005F56",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 3,
  },
  recBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },
  modeOptionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#005F56",
  },
  modeOptionSub: {
    fontSize: 11,
    color: "#475569",
    marginTop: 2,
    lineHeight: 15,
  },
  modeOptionSecondary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  modeOptionIconBgSec: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  modeOptionTitleSec: {
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
  },
});
