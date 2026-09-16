import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided in request." },
        { status: 400 }
      );
    }

    // Forward the file to Flask AI Service
    const flaskFormData = new FormData();
    flaskFormData.append("image", file);

    const flaskResponse = await fetch("http://127.0.0.1:5000/api/predict", {
      method: "POST",
      body: flaskFormData,
    });

    if (!flaskResponse.ok) {
      const errorData = await flaskResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || `AI Service returned status ${flaskResponse.status}` },
        { status: flaskResponse.status }
      );
    }

    const data = await flaskResponse.json();

    // Normalize image URLs to Next.js API proxy routes for reliable asset serving
    if (data.prediction_id) {
      if (data.heatmap_url) {
        const heatmapFilename = data.heatmap_url.split("/").pop();
        data.heatmap_url = `/api/ai/results/${data.prediction_id}/${heatmapFilename}`;
      }
      if (data.overlay_url) {
        const overlayFilename = data.overlay_url.split("/").pop();
        data.overlay_url = `/api/ai/results/${data.prediction_id}/${overlayFilename}`;
      }
    }
    if (data.uploaded_image_url) {
      const uploadedFilename = data.uploaded_image_url.split("/").pop();
      data.uploaded_image_url = `/api/ai/uploads/${uploadedFilename}`;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("AI Proxy Route Error:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to Flask AI Service at http://127.0.0.1:5000. Please ensure python app.py is running.",
        details: error?.message || String(error),
      },
      { status: 503 }
    );
  }
}
