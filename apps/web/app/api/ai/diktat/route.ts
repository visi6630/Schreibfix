import { NextResponse } from "next/server";
import { generateDiktatSentences } from "@/lib/ai-content";

export async function POST(req: Request) {
  const { grade, weakWords, topic } = await req.json() as {
    grade: number;
    weakWords: string[];
    topic?: string;
  };
  const sentences = await generateDiktatSentences(grade, weakWords, topic);
  return NextResponse.json(sentences);
}
