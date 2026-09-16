import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ predictionId: string; filename: string }> }
) {
  try {
    const { predictionId, filename } = await params;
    const flaskUrl = `http://127.0.0.1:5000/results/${predictionId}/${filename}`;
    const res = await fetch(flaskUrl);

    if (!res.ok) {
      return new NextResponse("Image not found", { status: res.status });
    }

    const blob = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/png";

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error: any) {
    console.error("Error proxying AI result image:", error);
    return new NextResponse("Failed to fetch image from Flask microservice", { status: 500 });
  }
}
