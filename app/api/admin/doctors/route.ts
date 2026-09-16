import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../src/lib/auth";
import { prisma } from "../../../../src/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

// Reusable function to verify Super Admin access
async function verifySuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== "SUPER_ADMIN") {
    return false;
  }
  return true;
}

export async function GET() {
  try {
    const isSuperAdmin = await verifySuperAdmin();
    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctors = await prisma.user.findMany({
      where: { role: Role.DOCTOR },
      select: {
        id: true,
        name: true,
        email: true,
        institution: true,
        hospitalName: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(doctors);
  } catch (error: any) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isSuperAdmin = await verifySuperAdmin();
    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, institution, hospitalName } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create doctor
    const newDoctor = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: Role.DOCTOR,
        institution: institution || "Unassigned",
        hospitalName: hospitalName || "Unassigned",
      },
      select: {
        id: true,
        name: true,
        email: true,
        institution: true,
        hospitalName: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error: any) {
    console.error("Error creating doctor:", error);
    return NextResponse.json({ error: "Failed to create doctor" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isSuperAdmin = await verifySuperAdmin();
    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing doctor ID" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json({ error: "Failed to delete doctor" }, { status: 500 });
  }
}
