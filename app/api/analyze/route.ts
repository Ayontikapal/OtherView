import { NextRequest, NextResponse } from "next/server";
import { analyzeAccessibilityImage } from "@/lib/ai/analyze-image";
import { getUnifiedUser } from "@/lib/auth/unified-auth";

export const runtime = "nodejs";
export const maxDuration = 60; // Next.js serverless route timeout

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

// Simple in-memory rate limiting map (IP -> timestamps)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

function validateImageMagicBytes(buffer: Buffer, reportedMime: string): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return reportedMime === "image/jpeg" || reportedMime === "image/jpg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return reportedMime === "image/png";
  }

  // WebP: 'RIFF' .... 'WEBP'
  const isRiff =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46;
  const isWebp =
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;
  if (isRiff && isWebp) {
    return reportedMime === "image/webp";
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          message:
            "Too many requests. Please wait a minute before analyzing another photo.",
        },
        { status: 429 }
      );
    }

    let buffer: Buffer | null = null;
    let mimeType = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("image") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "NO_IMAGE", message: "No image file provided in request." },
          { status: 400 }
        );
      }
      mimeType = file.type.toLowerCase();
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      const { image, mimeType: declaredMime } = body;
      if (!image || typeof image !== "string") {
        return NextResponse.json(
          { error: "NO_IMAGE", message: "No image payload provided." },
          { status: 400 }
        );
      }

      mimeType = (declaredMime || "image/jpeg").toLowerCase();
      const cleanBase64 = image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      buffer = Buffer.from(cleanBase64, "base64");
    } else {
      return NextResponse.json(
        {
          error: "UNSUPPORTED_MEDIA_TYPE",
          message: "Request must be multipart/form-data or application/json.",
        },
        { status: 415 }
      );
    }

    // Size limit check
    if (!buffer || buffer.length === 0) {
      return NextResponse.json(
        { error: "EMPTY_FILE", message: "Uploaded image file is empty." },
        { status: 400 }
      );
    }

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: "FILE_TOO_LARGE",
          message: `Image exceeds maximum allowed size of 5 MB (received ${(
            buffer.length /
            (1024 * 1024)
          ).toFixed(2)} MB).`,
        },
        { status: 413 }
      );
    }

    // Allowed mime check
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          error: "UNSUPPORTED_TYPE",
          message:
            "Unsupported file format. Please upload a JPG, JPEG, PNG, or WebP photograph.",
        },
        { status: 400 }
      );
    }

    // Magic bytes verification
    if (!validateImageMagicBytes(buffer, mimeType)) {
      return NextResponse.json(
        {
          error: "CORRUPTED_IMAGE",
          message:
            "File header does not match a valid JPG, PNG, or WebP image. Please check the file.",
        },
        { status: 400 }
      );
    }

    // Server-side Authentication Enforcement
    const user = await getUnifiedUser();
    if (!user) {
      return NextResponse.json(
        {
          error: "AUTH_REQUIRED",
          message:
            "Authentication is required to analyze a space photograph. Please sign in or create an account to start your accessibility review.",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    // Check API Key existence
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json(
        {
          error: "API_KEY_MISSING",
          message:
            "Gemini API key is not configured on the server. You can still test the complete application workflow using Demo Mode.",
          canUseDemo: true,
        },
        { status: 503 }
      );
    }

    // Execute Multimodal Analysis
    const base64Data = buffer.toString("base64");
    const analysis = await analyzeAccessibilityImage(base64Data, mimeType);

    return NextResponse.json({ success: true, data: analysis });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Accessibility Analysis Error:", err.message);

    if (err.message.includes("GEMINI_API_KEY_MISSING")) {
      return NextResponse.json(
        {
          error: "API_KEY_MISSING",
          message:
            "Server Gemini API key is missing. Please use Demo Mode to explore.",
          canUseDemo: true,
        },
        { status: 503 }
      );
    }

    if (
      err.message.includes("RATE_LIMIT") ||
      err.message.includes("429") ||
      err.message.includes("ResourceExhausted")
    ) {
      return NextResponse.json(
        {
          error: "PROVIDER_RATE_LIMIT",
          message:
            "AI service quota or rate limit reached. Please try again shortly or use Demo Mode.",
          canUseDemo: true,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "ANALYSIS_FAILED",
        message:
          "Unable to complete AI review for this photograph. Ensure the image is well-lit and unobstructed, or explore Demo Mode.",
        canUseDemo: true,
      },
      { status: 500 }
    );
  }
}
