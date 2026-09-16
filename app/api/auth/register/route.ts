import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return new Response("Missing required fields", { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return new Response("An account with this email already exists.", { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        role: role || "PATIENT",
      },
    });

    // Strip out the passwordHash before returning the user
    const { passwordHash: _, ...userWithoutPassword } = user;

    return Response.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error?.code === "P2002") {
      return new Response("An account with this email already exists.", { status: 409 });
    }

    return new Response(error?.message || "Internal server error during registration", { status: 500 });
  }
}
