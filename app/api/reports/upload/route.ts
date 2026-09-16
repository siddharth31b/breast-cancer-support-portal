import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../src/lib/auth";
import { prisma } from "../../../../src/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    let patientId = formData.get("patientId") as string | null;

    if (!patientId) {
      // fallback to current logged in user if not specified
      patientId = (session.user as any).id;
    }

    if (!file || !patientId) {
      return NextResponse.json({ error: "File and patientId are required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "reports");
    
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/reports/${filename}`;

    // First ensure patient profile exists
    let patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: patientId }
    });

    if (!patientProfile) {
      patientProfile = await prisma.patientProfile.create({
        data: {
          userId: patientId
        }
      });
    }

    const study = await prisma.diagnosticStudy.create({
      data: {
        patientId: patientProfile.id,
        studyType: "Uploaded Report",
        status: "QUEUED",
        dicomUrl: fileUrl,
      },
    });

    return NextResponse.json({ success: true, study });
  } catch (error: any) {
    console.error("Error uploading report:", error);
    return NextResponse.json({ error: "Failed to upload report" }, { status: 500 });
  }
}
