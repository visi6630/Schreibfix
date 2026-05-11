import { NextResponse } from "next/server";
import { generateVerbConjugation } from "@/lib/ai-content";

export async function POST(req: Request) {
  const { grade, count } = await req.json() as { grade: number; count: number };
  const exercises = await generateVerbConjugation(grade, count);
  return NextResponse.json(exercises);
}
