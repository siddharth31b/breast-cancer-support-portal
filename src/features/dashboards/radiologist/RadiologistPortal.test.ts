import { describe, test, expect } from "vitest";
import { RadiologistService } from "../../../services/radiologist.service";

describe("Radiologist Portal Workflow & PACS Ingestion Tests", () => {

  test("1. Patient search lookup identifies registered patients and rejects unregistered patients", () => {
    const meera = RadiologistService.searchPatients("Meera Sharma");
    expect(meera.length).toBeGreaterThan(0);
    expect(meera[0].name).toBe("Meera Sharma");
    expect(meera[0].assignedDoctor).toBe("Dr. Sarah Iyer");

    const sunita = RadiologistService.searchPatients("BC-1002");
    expect(sunita.length).toBeGreaterThan(0);
    expect(sunita[0].name).toBe("Sunita Deshmukh");

    const nonExistent = RadiologistService.searchPatients("NON_EXISTENT_ID_999999");
    expect(nonExistent.length).toBe(0);
  });

  test("2. Uploading a study generates unique Study ID and appends to worklist", () => {
    const initialCount = RadiologistService.getStudies().length;

    const uploaded = RadiologistService.uploadStudy({
      patientId: "MS-9281",
      patientName: "Meera Sharma",
      patientAge: 34,
      gender: "Female",
      assignedDoctor: "Dr. Sarah Iyer",
      imagingType: "Mammogram (FFDM)",
      side: "Left",
      priority: "URGENT",
      fileName: "test_mammogram_scan.dcm",
    });

    expect(uploaded.id).toContain("ST-");
    expect(uploaded.patientName).toBe("Meera Sharma");
    expect(uploaded.status).toBe("Pending");
    expect(uploaded.aiStatus).toBe("AI Processing");

    const updatedCount = RadiologistService.getStudies().length;
    expect(updatedCount).toBe(initialCount + 1);
  });

  test("3. Saving a draft updates study status to Draft", () => {
    const studies = RadiologistService.getStudies();
    const target = studies[0];

    const draft = RadiologistService.saveDraft(target.id, {
      birads: "3",
      impression: "Probably benign mass. Follow up in 6 months.",
    });

    expect(draft.status).toBe("Draft");
    expect(draft.birads).toBe("3");
    expect(draft.impression).toBe("Probably benign mass. Follow up in 6 months.");
  });

  test("4. Submitting a report finalises study and includes in reports list", () => {
    const studies = RadiologistService.getStudies();
    const target = studies[0];

    const submitted = RadiologistService.submitReport(target.id, {
      birads: "4A",
      findingType: "Mass",
      impression: "Low suspicion of malignancy. Core biopsy recommended.",
      recommendations: "Biopsy recommended.",
    });

    expect(submitted.status).toBe("Reviewed");
    expect(submitted.submittedAt).toBeDefined();

    const reports = RadiologistService.getReports();
    const matchingReport = reports.find((r) => r.studyId === target.id);
    expect(matchingReport).toBeDefined();
    expect(matchingReport?.birads).toBe("4A");
    expect(matchingReport?.status).toBe("Submitted");
  });

});
