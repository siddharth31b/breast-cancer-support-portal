import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../src/lib/auth";
import { prisma } from "../../../src/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get("patientId"); // this is the user.id

    if (!userId) {
      return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId }
    });

    if (!patientProfile) {
      return NextResponse.json([]);
    }

    const studies = await prisma.diagnosticStudy.findMany({
      where: { patientId: patientProfile.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(studies);
  } catch (error: any) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
