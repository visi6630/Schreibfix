import { supabase } from "./supabase";

type ApiType = "elevenlabs" | "claude" | "internal";

// Claude Haiku approximate pricing
const CLAUDE_INPUT_PER_TOKEN = 0.0000008; // $0.80/M input tokens
const CLAUDE_OUTPUT_PER_TOKEN = 0.000004; // $4.00/M output tokens
// ElevenLabs Multilingual v2 approximate pricing
const ELEVENLABS_PER_CHAR = 0.0003; // $0.30/1000 chars

export function computeClaudeCost(inputTokens: number, outputTokens: number): number {
  return inputTokens * CLAUDE_INPUT_PER_TOKEN + outputTokens * CLAUDE_OUTPUT_PER_TOKEN;
}

export function computeElevenLabsCost(characters: number): number {
  return characters * ELEVENLABS_PER_CHAR;
}

export async function logApiCall(params: {
  userId?: string | null;
  apiType: ApiType;
  endpoint?: string;
  tokensUsed?: number;
  charactersUsed?: number;
  costEstimate?: number;
}): Promise<void> {
  try {
    await supabase.from("api_logs").insert({
      user_id: params.userId ?? null,
      api_type: params.apiType,
      endpoint: params.endpoint ?? null,
      tokens_used: params.tokensUsed ?? 0,
      characters_used: params.charactersUsed ?? 0,
      cost_estimate: params.costEstimate ?? 0,
    });
  } catch (err) {
    console.error("Failed to log API call:", err);
  }
}

export async function logError(params: {
  userId?: string | null;
  errorType: string;
  errorMessage: string;
  page?: string;
}): Promise<void> {
  try {
    await supabase.from("error_logs").insert({
      user_id: params.userId ?? null,
      error_type: params.errorType,
      error_message: params.errorMessage,
      page: params.page ?? null,
    });
  } catch (err) {
    console.error("Failed to log error:", err);
  }
}
