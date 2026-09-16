# BreastCare AI - 100 Subject Simulation Audit Report

**Date of Simulation:** 10/9/2026, 4:07:31 pm
**Total Subjects Evaluated:** 100
**Evaluation Engine:** Phased Clinical Oncology Triage Engine (v2.0)

## 1. Executive Tier Distribution

| Risk Tier | Count | Percentage | Clinical Protocol |
| :--- | :--- | :--- | :--- |
| **Low** | 45 | 45% | Routine annual screening & monthly self-exams |
| **Moderate** | 22 | 22% | Clinical breast exam & physician follow-up within 2-4 weeks |
| **High** | 18 | 18% | Urgent specialist consultation & bilateral diagnostic imaging |
| **Urgent** | 15 | 15% | Immediate safety-net referral (< 72 hours expedited pathway) |

## 2. Averages & Score Metrics

- **Average Total Clinical Score:** `9.9` points
- **Average Baseline Risk Modifier (BRM):** `4.0` points
- **Average Phased Symptom Score:** `5.9` points

## 3. Safety-Net Escalation Overrides Triggered

| Safety Override Rule | Times Triggered | Description |
| :--- | :--- | :--- |
| **Metastatic Pattern Alert** | 5 | Automatic escalation to Urgent tier regardless of numeric threshold |
| **Classic Malignancy Triad** | 5 | Automatic escalation to Urgent tier regardless of numeric threshold |
| **Ulcerative / Open Skin Lesion Alert** | 4 | Automatic escalation to Urgent tier regardless of numeric threshold |

## 4. Cohort Sample Table (First 15 Subjects)

| ID | Patient Name | Cohort | Age | BRM | Symptom Pts | Total | Tier | Override |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SIM-PAT-001` | Aaradhya Sharma | Cohort 1 | < 30 years | 1 | 0 | **1** | **Low** | None |
| `SIM-PAT-002` | Pooja Gupta | Cohort 1 | 30–40 years | 0 | 0 | **0** | **Low** | None |
| `SIM-PAT-003` | Sunita Kushwaha | Cohort 1 | 30–40 years | 2 | 0 | **2** | **Low** | None |
| `SIM-PAT-004` | Meera Trivedi | Cohort 1 | 30–40 years | 1 | 2.2 | **3.2** | **Low** | None |
| `SIM-PAT-005` | Ananya Iyer | Cohort 1 | 30–40 years | 2 | 0 | **2** | **Low** | None |
| `SIM-PAT-006` | Deepa Deshmukh | Cohort 1 | 30–40 years | 0 | 0 | **0** | **Low** | None |
| `SIM-PAT-007` | Kavita Shukla | Cohort 1 | 30–40 years | 1 | 0 | **1** | **Low** | None |
| `SIM-PAT-008` | Sangeeta Verma | Cohort 1 | 30–40 years | 2 | 0 | **2** | **Low** | None |
| `SIM-PAT-009` | Rekha Singh | Cohort 1 | < 30 years | 1 | 1.1 | **2.1** | **Low** | None |
| `SIM-PAT-010` | Ritu Joshi | Cohort 1 | < 30 years | 1 | 1.1 | **2.1** | **Low** | None |
| `SIM-PAT-011` | Priyanka Reddy | Cohort 1 | < 30 years | 0 | 0 | **0** | **Low** | None |
| `SIM-PAT-012` | Nisha Banerjee | Cohort 1 | 30–40 years | 1 | 2.2 | **3.2** | **Low** | None |
| `SIM-PAT-013` | Shalini Kulkarni | Cohort 1 | < 30 years | 1 | 0 | **1** | **Low** | None |
| `SIM-PAT-014` | Jyoti Pandey | Cohort 1 | 30–40 years | 1 | 0 | **1** | **Low** | None |
| `SIM-PAT-015` | Mamta Patel | Cohort 1 | < 30 years | 2 | 0 | **2** | **Low** | None |
