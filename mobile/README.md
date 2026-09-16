# BreastCare AI Mobile Assessment Application

A dedicated lightweight **React Native / Expo** mobile application for patients to complete breast health risk self-assessments on their mobile phones and submit results directly to their doctors.

---

## 📱 Features

1. **Patient Guided Self-Assessment**:
   - Step-by-step touch-friendly symptom selector (Lumps, Pain, Nipple Discharge, Skin/Shape Changes).
   - Side selector (Left, Right, Both) and specific lump/discharge characteristics.
2. **Local Risk Engine & Triage**:
   - Instant preliminary care guidance result (`LOW`, `MEDIUM`, `HIGH`).
3. **Direct Submission to Doctor**:
   - Direct transmission of patient answers & calculated risk score to the doctor's web portal (`POST /api/mobile/assessments`).

---

## 🚀 How to Run Mobile App

### 1. Prerequisites
- Node.js (v18+)
- Expo CLI or Expo Go app on your physical mobile device (Android / iOS)

### 2. Launch Mobile App
Navigate to the `mobile/` directory and start the Expo dev server:

```bash
cd mobile
npm install
npm start
```

### 3. Run on Mobile Phone / Emulator
- **Physical Phone**: Scan the QR code displayed in your terminal using the **Expo Go** app (available on Google Play / App Store).
- **Web Browser Preview**: Press `w` in terminal to launch in browser preview mode (`http://localhost:8081`).
- **Android Emulator**: Press `a` in terminal to launch on connected Android device/emulator.
- **iOS Simulator**: Press `i` in terminal to launch on iOS simulator (macOS required).

---

## 📡 API Sync with Web Backend

The mobile application sends assessment submissions to:
`POST /api/mobile/assessments`

**Example Request Payload**:
```json
{
  "patientId": "patient_mobile_demo",
  "doctorId": "doctor_assigned_1",
  "answers": [
    { "questionId": "current_concern", "value": ["breast_lump", "nipple_discharge"] },
    { "questionId": "breast_side", "value": "left" },
    { "questionId": "lump_characteristics", "value": "hard" },
    { "questionId": "discharge_type", "value": "bloody" }
  ]
}
```
