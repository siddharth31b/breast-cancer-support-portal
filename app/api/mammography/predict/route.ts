import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  let tempFilePath = "";
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const thresholdStr = (formData.get("threshold") as string) || "0.40";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No mammogram file provided in request." },
        { status: 400 }
      );
    }

    // 1. Attempt to forward to Python FastAPI CAD server on port 8000 if running
    try {
      const fastApiFormData = new FormData();
      fastApiFormData.append("file", file);
      fastApiFormData.append("threshold", thresholdStr);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const fastApiResponse = await fetch("http://127.0.0.1:8000/api/predict", {
        method: "POST",
        body: fastApiFormData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (fastApiResponse.ok) {
        const data = await fastApiResponse.json();
        return NextResponse.json(data);
      }
    } catch {
      // Port 8000 is offline; proceed to our clinical segmentation pipeline
    }

    // 2. High-Resolution Clinical Segmentation Pipeline
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save temporary upload file for OpenCV processor
    const scratchDir = path.join(process.cwd(), "scratch");
    await fs.mkdir(scratchDir, { recursive: true });
    const tempFileName = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    tempFilePath = path.join(scratchDir, tempFileName);
    await fs.writeFile(tempFilePath, buffer);

    const scriptPath = path.join(process.cwd(), "scripts", "mammography_inference.py");

    const { stdout, stderr } = await execFileAsync(
      "python",
      [scriptPath, "--input", tempFilePath, "--threshold", thresholdStr, "--filename", file.name],
      { maxBuffer: 50 * 1024 * 1024 }
    );

    if (stderr && stderr.includes("Error")) {
      console.warn("Python segmentation warning:", stderr);
    }

    const pyResult = JSON.parse(stdout);

    const fnUpper = file.name.toUpperCase();
    const breast: "LEFT" | "RIGHT" = pyResult.metadata?.breast || (fnUpper.includes("RIGHT") ? "RIGHT" : "LEFT");
    const view: "CC" | "MLO" = pyResult.metadata?.view || (fnUpper.includes("MLO") ? "MLO" : "CC");

    return NextResponse.json({
      success: true,
      filename: file.name,
      metadata: {
        patient_id: pyResult.metadata?.patient_id || file.name.split(".")[0].toUpperCase() || "P_UPLOAD",
        breast,
        view,
        ...(pyResult.metadata || {})
      },
      clinical_metrics: pyResult.clinical_metrics,
      images: pyResult.images,
    });
  } catch (err: any) {
    console.error("Mammography Predict Route Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to process mammogram scan." },
      { status: 500 }
    );
  } finally {
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch {
        // cleanup ignore
      }
    }
  }
}
