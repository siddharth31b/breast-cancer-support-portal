import { Role, BiradsCategory } from "@prisma/client";
import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting BreastCare AI Database Seeding...");

  const defaultPasswordHash = await bcrypt.hash("Demo@123", 10);

  // 1. Seed Users for all 7 Roles
  const usersData = [
    {
      id: "demo-patient",
      name: "Meera Sharma",
      email: "patient@demo.breastcare.ai",
      role: Role.PATIENT,
      passwordHash: defaultPasswordHash,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Meera",
      institution: "IIT Indore Clinical Research Portal",
    },
    {
      id: "demo-doctor",
      name: "Dr. Sarah Iyer",
      email: "doctor@demo.breastcare.ai",
      role: Role.DOCTOR,
      passwordHash: defaultPasswordHash,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah",
      institution: "IIT Indore Research Hospital",
      hospitalName: "IIT Indore Main Campus Hospital",
    },
    {
      id: "demo-radiologist",
      name: "Dr. Rajesh Kumar",
      email: "radiologist@demo.breastcare.ai",
      role: Role.RADIOLOGIST,
      passwordHash: defaultPasswordHash,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rajesh",
      institution: "IIT Indore Imaging Lab",
      hospitalName: "IIT Indore Main Campus Hospital",
    },
    {
      id: "demo-hospital",
      name: "Amit Patel",
      email: "hospital@demo.breastcare.ai",
      role: Role.HOSPITAL_ADMIN,
      passwordHash: defaultPasswordHash,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Amit",
      institution: "IIT Indore Administration Office",
      hospitalName: "IIT Indore Main Campus Hospital",
    },
    {
      id: "demo-researcher",
      name: "Dr. Sunita Sharma",
      email: "researcher@demo.breastcare.ai",
      role: Role.RESEARCHER,
      passwordHash: defaultPasswordHash,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sunita",
      institution: "Drishti CPS Research Hub",
    },
    {
      id: "demo-fieldworker",
      name: "Pooja Devi",
      email: "fieldworker@demo.breastcare.ai",
      role: Role.FIELD_WORKER,
      passwordHash: defaultPasswordHash,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Pooja",
      institution: "Drishti CPS Field Outreach",
    },
    {
      id: "demo-admin",
      name: "Super Admin",
      email: "admin@demo.breastcare.ai",
      role: Role.SUPER_ADMIN,
      passwordHash: defaultPasswordHash,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
      institution: "BreastCare AI System Admin",
    },
  ];

  for (const userData of usersData) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: userData,
      create: userData,
    });
  }
  console.log("✅ 7 Demo Accounts Created/Updated.");

  // 2. Patient Profile & Care Plan Tasks
  const patientProfile = await prisma.patientProfile.upsert({
    where: { userId: "demo-patient" },
    update: { age: 42, bmi: 23.4, medicalHistory: "Routine mammogram screening scheduled. Family history of benign cysts." },
    create: {
      userId: "demo-patient",
      age: 42,
      bmi: 23.4,
      medicalHistory: "Routine mammogram screening scheduled. Family history of benign cysts.",
    },
  });

  const tasks = [
    { title: "Monthly Breast Self-Exam", frequency: "Monthly", status: "completed" },
    { title: "Annual Mammography Screening", frequency: "Annual", status: "pending" },
    { title: "Review Clinical Consultation Summary", frequency: "One-time", status: "completed" },
  ];

  for (const t of tasks) {
    await prisma.carePlanTask.create({
      data: {
        patientProfileId: patientProfile.id,
        title: t.title,
        frequency: t.frequency,
        status: t.status,
      },
    });
  }
  console.log("✅ Patient Profile & Care Plan Tasks Seeded.");

  // 3. Diagnostic Study for Radiologist & Doctor Workflow
  await prisma.diagnosticStudy.create({
    data: {
      patientId: patientProfile.id,
      doctorId: "demo-doctor",
      radiologistId: "demo-radiologist",
      studyType: "Digital Bilateral Mammogram",
      aiRiskScore: 0.18,
      biradsCategory: BiradsCategory.BI_RADS_2,
      clinicalNotes: "Benign calcifications in left upper quadrant. Low overall risk score.",
      status: "COMPLETED",
    },
  });

  // 4. CHW Village Visits
  await prisma.villageVisit.createMany({
    data: [
      { fieldWorkerId: "demo-fieldworker", villageName: "Simrol", villageCode: "VIL-01", screeningsCount: 24, highRiskCases: 2 },
      { fieldWorkerId: "demo-fieldworker", villageName: "Kasturbagram", villageCode: "VIL-02", screeningsCount: 18, highRiskCases: 1 },
      { fieldWorkerId: "demo-fieldworker", villageName: "Bicholi", villageCode: "VIL-03", screeningsCount: 31, highRiskCases: 4 },
    ],
  });
  console.log("✅ CHW Village Screenings Seeded.");

  // 5. Hospital Performance Metrics
  await prisma.hospitalMetrics.create({
    data: {
      hospitalName: "IIT Indore Main Campus Hospital",
      activeBeds: 140,
      icuCapacity: 25,
      radiologyLoad: 42,
      departmentName: "Oncology & Radiology Wing",
    },
  });

  // 6. Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: "demo-admin",
      action: "DATABASE_INITIALIZED",
      details: "Seeded initial 7-role enterprise database schema",
      ipAddress: "127.0.0.1",
    },
  });

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
