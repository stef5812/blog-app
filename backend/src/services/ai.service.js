// backend/src/services/ai.service.js
import { generateText } from "../lib/aiClient.js";

function cleanOutput(text) {
  return String(text || "").trim();
}

export async function rewriteText({
  text,
  instruction = "Improve clarity, flow, and grammar while preserving meaning.",
}) {
  if (!text || !text.trim()) {
    throw new Error("Text is required.");
  }

  const prompt = `
You are an assistant helping a blog author improve a draft.

Task:
Rewrite the text below according to the instruction.

Rules:
- Preserve the original meaning
- Improve clarity, grammar, and flow
- Do not add factual claims not present in the source
- Return only the rewritten text
- Do not include headings, notes, or quotation marks unless already present

Instruction:
${instruction}

Text:
"""${text}"""
`.trim();

  const output = await generateText({ prompt });
  return cleanOutput(output);
}

export async function generateTitles(content) {
  if (!content || !content.trim()) {
    throw new Error("Content is required.");
  }

  const prompt = `
You are an expert blog editor.

Task:
Generate 3 engaging blog post titles based on the content below.

Rules:
- Keep titles concise
- Make them compelling
- Do not include numbering
- Do not include bullet points
- Return one title per line
- Return only the titles

Content:
"""${content}"""
`.trim();

  const output = await generateText({ prompt });

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}