export const CLINICAL_RULES = {
  bloodPressure: {
    validation: {
      minSystolic: 40,
      maxSystolic: 260,
      minDiastolic: 30,
      maxDiastolic: 180,
      minPulse: 30,
      maxPulse: 220
    },
    thresholds: {
      low: { systolic: 90, diastolic: 60 },
      high: { systolic: 140, diastolic: 90 },
      emergency: { systolic: 180, diastolic: 120 }
    },
    copy: {
      crisis: "This reading is very high. Rest and repeat the measurement correctly. If it remains very high, or if you have severe headache, chest pain, difficulty breathing, weakness, confusion or vision changes, seek urgent medical help.",
      lowWarning: "Low readings may be normal for some people. If you feel dizzy, faint, confused or unwell, contact a healthcare professional. Please seek prompt medical assistance."
    }
  },
  bloodGlucose: {
    validation: {
      minMGDL: 20,
      maxMGDL: 800,
      minMMOLL: 1.1,
      maxMMOLL: 44.4,
      minHbA1c: 3,
      maxHbA1c: 20
    },
    thresholds: {
      fasting: { expectedMax: 110, diabetesMin: 126 },
      twoHourOGTT: { expectedMax: 140, diabetesMin: 200 },
      random: { diabetesMin: 200 },
      hba1c: { diabetesMin: 6.5 }
    },
    copy: {
      pregnancyContext: "Pregnancy uses specific glucose-testing criteria. Please record this result for review by your obstetric or clinical care team.",
      hba1cDisclaimer: "Conditions affecting red blood cells, haemoglobin or pregnancy may affect interpretation.",
      homeMeterDisclaimer: "Home meter results can vary and should be interpreted with your care team.",
      hypoAlert: "This reading is very low and may require prompt clinical attention. Eat or drink fast-acting sugar (e.g. fruit juice, sweets) and contact your care team or emergency services immediately if symptoms persist.",
      hyperAlert: "This reading is extremely high. Drink water, avoid exercise, and contact your care team or seek prompt medical assistance."
    }
  }
};
