import type { UserRole, Permission } from "../types";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  PATIENT: [
    "profile:read-own",
    "profile:update-own",
    "assessment:create-own",
    "assessment:read-own",
    "report:upload-own",
    "report:read-own",
    "appointment:manage-own",
    "consent:manage-own"
  ],

  DOCTOR: [
    "patient:read-assigned",
    "assessment:review-assigned",
    "ai-result:read-assigned",
    "clinical-review:create",
    "care-plan:create",
    "referral:create",
    "follow-up:create"
  ],

  RADIOLOGIST: [
    "study:read-assigned",
    "study:annotate-assigned",
    "ai-overlay:review",
    "radiology-report:create"
  ],

  HOSPITAL_ADMIN: [
    "hospital:read-own",
    "staff:manage-own-hospital",
    "appointment:manage-own-hospital",
    "analytics:read-own-hospital"
  ],

  RESEARCHER: [
    "dataset:read-anonymized",
    "cohort:create",
    "model-metrics:read",
    "export:create-approved"
  ],

  COMMUNITY_HEALTH_WORKER: [
    "patient:register-assisted",
    "assessment:create-assisted",
    "referral:create",
    "offline-record:sync"
  ],

  BREAST_CARE_NURSE: [
    "patient:register-own-hospital",
    "patient:read-assigned-or-intake",
    "intake:create",
    "intake:update-draft",
    "intake:submit",
    "vitals:create",
    "bmi:record",
    "report:upload-assisted",
    "consent:record",
    "doctor-request:respond"
  ],

  SUPER_ADMIN: [
    "hospital:manage-all",
    "user:manage-all",
    "role:manage-all",
    "model:govern",
    "audit:read-all",
    "system:manage"
  ]
};
