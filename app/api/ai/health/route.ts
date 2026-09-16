import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/health", {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { online: false, status: "Flask AI microservice returned error status" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ online: true, ...data });
  } catch (err: any) {
    return NextResponse.json({
      online: false,
      error: "Flask AI microservice offline on http://127.0.0.1:5000",
    });
  }
}
