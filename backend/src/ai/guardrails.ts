import { z } from "zod";
import { AiClassification } from "../types";

export const aiSchema = z.object({
  category: z.enum(["damaged", "wrong_item", "changed_mind", "other"]),
  confidence: z.number().min(0).max(1),
  suspicious: z.boolean(),
  customer_message: z.string().min(1).max(1000),
  reasoning: z.string().min(1).max(2000),
});
const injection =
  /(ignore (all|any|previous) instructions|you are now|system message|developer message|reveal (the )?prompt)/gi;
export function sanitizeRequest(message: string): string {
  return message
    .replace(injection, "[removed instruction]")
    .trim()
    .slice(0, 2000);
}
export function parseAiOutput(value: unknown): AiClassification {
  return aiSchema.parse(value);
}
