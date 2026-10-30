import { GoogleGenerativeAI } from "@google/generative-ai";
import { ACCESSIBILITY_ANALYSIS_SYSTEM_PROMPT, ACCESSIBILITY_ANALYSIS_USER_PROMPT } from "./prompts";
import { accessibilityAnalysisSchema } from "@/lib/validation/analysis-schema";
import { AccessibilityAnalysis } from "@/types/analysis";

export async function analyzeAccessibilityImage(
  base64Data: string,
  mimeType: string,
  options?: { apiKey?: string; model?: string }
): Promise<AccessibilityAnalysis> {
  const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
  const preferredModel = options?.model || process.env.GEMINI_MODEL || "gemini-2.5-flash";

  // List models to try: preferred first, then reliable fallback
  const modelsToTry = [preferredModel];
  if (preferredModel !== "gemini-1.5-flash") {
    modelsToTry.push("gemini-1.5-flash");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: Error | null = null;
  let rawJson = "";

  for (const currentModel of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: currentModel,
        systemInstruction: ACCESSIBILITY_ANALYSIS_SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const result = await model.generateContent([
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType,
          },
        },
        { text: ACCESSIBILITY_ANALYSIS_USER_PROMPT },
      ]);

      const responseText = result.response.text();
      if (!responseText || responseText.trim().length === 0) {
        throw new Error("EMPTY_RESPONSE");
      }

      rawJson = responseText.trim();
      // Remove any surrounding markdown backticks if model included them
      if (rawJson.startsWith("```json")) {
        rawJson = rawJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (rawJson.startsWith("```")) {
        rawJson = rawJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      break; // Success!
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // If error indicates model not found or unsupported, loop to fallback model
      const msg = lastError.message.toLowerCase();
      if (msg.includes("not found") || msg.includes("404") || msg.includes("unsupported")) {
        console.warn(`Model ${currentModel} unavailable, attempting fallback...`);
        continue;
      }
      throw lastError;
    }
  }

  if (!rawJson) {
    throw lastError || new Error("FAILED_TO_GENERATE_ANALYSIS");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error("INVALID_JSON_RESPONSE");
  }

  // Validate strictly with runtime Zod schema
  const validationResult = accessibilityAnalysisSchema.safeParse(parsed);
  if (!validationResult.success) {
    console.error("Zod Validation Errors:", validationResult.error.format());
    const issues = validationResult.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    throw new Error(`SCHEMA_VALIDATION_FAILED: ${issues}`);
  }

  return validationResult.data;
}
