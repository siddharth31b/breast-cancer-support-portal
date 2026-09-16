import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Frontend Route Protection (Role-based access)
    if (path.startsWith("/doctor") && token?.role !== "DOCTOR" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/patient") && token?.role !== "PATIENT" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/nurse") && token?.role !== "BREAST_CARE_NURSE" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/radiologist") && token?.role !== "RADIOLOGIST" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/hospital") && token?.role !== "HOSPITAL_ADMIN" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/research") && token?.role !== "RESEARCHER" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/field") && token?.role !== "COMMUNITY_HEALTH_WORKER" && token?.role !== "FIELD_WORKER" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/admin") && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // RBAC Logic for API routes
    if (path.startsWith("/api/doctor") && token?.role !== "DOCTOR" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (path.startsWith("/api/radiologist") && token?.role !== "RADIOLOGIST" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (path.startsWith("/api/admin") && token?.role !== "SUPER_ADMIN" && token?.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET || "breastcare_ai_super_secret_jwt_key_2026",
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Define which routes this middleware applies to
export const config = {
  matcher: [
    "/patient/:path*",
    "/doctor/:path*",
    "/nurse/:path*",
    "/radiologist/:path*",
    "/hospital/:path*",
    "/research/:path*",
    "/field/:path*",
    "/admin/:path*",
    "/api/doctor/:path*",
    "/api/radiologist/:path*",
    "/api/admin/:path*",
  ],
};
