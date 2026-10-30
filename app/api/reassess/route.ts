import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { reassessmentAnalysisSchema } from "@/lib/validation/analysis-schema";
import { REASSESSMENT_SYSTEM_PROMPT, REASSESSMENT_USER_PROMPT } from "@/lib/ai/prompts-reassess";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function validateMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
  // WebP: RIFF ... WEBP
  const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  return isRiff && isWebp;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { beforeImage, afterImage, originalFindings } = body;

    if (!beforeImage || !afterImage) {
      return NextResponse.json(
        { error: "MISSING_IMAGES", message: "Both before and after photographs are required for reassessment." },
        { status: 400 }
      );
    }

    const cleanBefore = beforeImage.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    const cleanAfter = afterImage.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    const beforeBuf = Buffer.from(cleanBefore, "base64");
    const afterBuf = Buffer.from(cleanAfter, "base64");

    if (beforeBuf.length > MAX_FILE_SIZE_BYTES || afterBuf.length > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "FILE_TOO_LARGE", message: "One or both images exceed the 5 MB limit." },
        { status: 413 }
      );
    }

    if (!validateMagicBytes(beforeBuf) || !validateMagicBytes(afterBuf)) {
      return NextResponse.json(
        { error: "CORRUPTED_IMAGE", message: "One or both images have invalid image headers." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json(
        {
          error: "API_KEY_MISSING",
          message: "Gemini API key is not configured on the server. You can test Before vs After review using Demo Mode.",
          canUseDemo: true,
        },
        { status: 503 }
      );
    }

    const preferredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const modelsToTry = [preferredModel];
    if (preferredModel !== "gemini-1.5-flash") {
      modelsToTry.push("gemini-1.5-flash");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let rawJson = "";
    let lastError: Error | null = null;

    const findingsPrompt = JSON.stringify(originalFindings || [], null, 2);
    const userPromptText = REASSESSMENT_USER_PROMPT.replace("__ORIGINAL_FINDINGS_JSON__", findingsPrompt);

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: REASSESSMENT_SYSTEM_PROMPT,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const result = await model.generateContent([
          { inlineData: { data: cleanBefore, mimeType: "image/jpeg" } },
          { inlineData: { data: cleanAfter, mimeType: "image/jpeg" } },
          { text: userPromptText },
        ]);

        const responseText = result.response.text();
        if (!responseText) throw new Error("EMPTY_RESPONSE");

        rawJson = responseText.trim();
        if (rawJson.startsWith("```json")) {
          rawJson = rawJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (rawJson.startsWith("```")) {
          rawJson = rawJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        continue;
      }
    }

    if (!rawJson) {
      throw lastError || new Error("REASSESSMENT_FAILED");
    }

    const parsed = JSON.parse(rawJson);
    const validated = reassessmentAnalysisSchema.safeParse(parsed);
    if (!validated.success) {
      console.error("Zod Validation Error on Reassessment:", validated.error.format());
      return NextResponse.json(
        { error: "VALIDATION_FAILED", message: "Reassessment response schema validation failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: validated.data });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return NextResponse.json(
      { error: "REASSESSMENT_ERROR", message: error.message || "Failed to process comparative reassessment." },
      { status: 500 }
    );
  }
}
