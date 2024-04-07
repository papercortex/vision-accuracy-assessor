import { openai } from "../openai";
import { Metrics, OverallMetrics } from "../../metrics/calculate";

export async function analyzeCalculatedMetrics(
  metrics: Record<string, Metrics>,
  overallMetrics: OverallMetrics
) {
  if (!process.env.OPENAI_ANALYSIS_ASSISTANT_ID) {
    throw new Error("OPENAI_ANALYSIS_ASSISTANT_ID is not set");
  }
  const thread = await openai.beta.threads.create();
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: JSON.stringify({
      metrics,
      overallMetrics,
    }),
  });
  let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: process.env.OPENAI_ANALYSIS_ASSISTANT_ID,
  });
  if (run.status === "completed") {
    const messages = await openai.beta.threads.messages.list(run.thread_id);
    for (const message of messages.data.reverse()) {
      // @ts-ignore
      if (!message.content[0]?.text) {
        continue;
      }
      if (message.role === "assistant") {
        // @ts-ignore
        return message.content[0]?.text.value;
      }
    }
  }
  console.log("OPENAI ANALYSIS FAILED");
  console.log(run);
  throw new Error("OpenAI analysis failed");
}
