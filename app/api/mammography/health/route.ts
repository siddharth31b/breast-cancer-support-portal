import { NextResponse } from "next/server";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch("http://127.0.0.1:8000/api/health", {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({
        online: false,
        status: "FastAPI CAD backend returned non-OK status",
      });
    }

    const data = await res.json();
    return NextResponse.json({
      online: true,
      ...data,
    });
  } catch {
    return NextResponse.json({
      online: false,
      message: "FastAPI CAD service offline on http://127.0.0.1:8000 (Workstation operating in local diagnostic mode)",
    });
  }
}
