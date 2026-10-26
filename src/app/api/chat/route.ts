import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LEAVE_POLICY_FULL_TEXT } from "@/data/leavePolicy";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, customApiKey } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "A valid message string is required." },
        { status: 400 }
      );
    }

    const apiKey = (customApiKey && customApiKey.trim().length > 0)
      ? customApiKey.trim()
      : process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "No API key provided. Please configure GEMINI_API_KEY in .env.local or enter your key via the Settings button.",
        },
        { status: 401 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // High-performance models: gemini-3.1-flash-lite answers in 1.9s (500 RPD)
    const candidateModels = [
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash"
    ];

    let reply = "";
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 800,
          },
          systemInstruction: `You are the official HR Leave Policy Assistant for XYZ Company.
Your purpose is to answer employee questions strictly and exclusively using the attached Sample Leave Policy.

==================== ATTACHED LEAVE POLICY (FULL TEXT) ====================
${LEAVE_POLICY_FULL_TEXT}
===========================================================================

YOU MUST STRICTLY ADHERE TO THESE THREE MANDATORY REQUIREMENTS AT ALL TIMES:

REQUIREMENT 1: ANSWER ACCURATELY AND CITE THE POLICY
- Answer employee questions accurately based ONLY on the attached policy content.
- In EVERY answer, point clearly to the relevant section of the policy (for example, "Section 4.1: Annual Leave" or "Section 6.2").
- Do NOT add rules, numbers, entitlements, or exceptions that are not in the policy text.

REQUIREMENT 2: ADMIT WHEN THE POLICY DOES NOT COVER THE QUESTION
- If the question asks about a policy, topic, benefit, or rule NOT mentioned in the attached document (for example, study leave, pet leave, sabbatical, work from home, bonus, salary), you MUST respond verbatim with:
  "I don't know, please contact HR."
- You MUST NOT guess, infer, calculate, or fall back on general knowledge about labor laws or common industry practice.

REQUIREMENT 3: PROTECT OTHER EMPLOYEES' PERSONAL DATA
- If a user asks for another employee's personal information, leave balance, or reason for absence (for example, "How many leave days has Rahim taken?", "Why is my colleague on medical leave?", "Who is on leave today?"):
  You MUST politely and courteously refuse.
- Reference Section 9 (Confidentiality of Leave Records), explaining that all employee leave records and medical details are strictly confidential, and direct the user to the proper authorized channel (the HR Department).

GENERAL INSTRUCTION:
- Keep answers professional, concise, and clear.
`,
        });

        const result = await model.generateContent(message);
        reply = result.response.text();
        if (reply) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed:`, err?.message || err);
      }
    }

    if (!reply) {
      throw lastError || new Error("All model candidates were unavailable.");
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error:
          "The HR Leave Policy service is currently experiencing a temporary connection delay. Please try your question again in a moment.",
      },
      { status: 500 }
    );
  }
}
