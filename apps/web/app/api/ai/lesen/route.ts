import { NextResponse } from "next/server";
import { generateReadingText } from "@/lib/ai-content";

export async function POST(req: Request) {
  const { grade, topic } = await req.json() as { grade: number; topic?: string };
  const text = await generateReadingText(grade, topic);
  return NextResponse.json(text);
}
