import fs from "fs/promises";
import { openai } from "../openai";

interface Prompts {
  withImage: string;
}
function extractCode(str: string): string | null {
  const lines = str.split("\n");
  let startLineIndex = -1;

  for (let idx = 0; idx < lines.length; idx++) {
    if (lines[idx]?.startsWith("```")) {
      if (startLineIndex === -1) {
        // Found the start of code block
        startLineIndex = idx + 1;
      } else {
        // Found the end of code block, return the extracted code
        return lines.slice(startLineIndex, idx).join("\n");
      }
    }
  }

  // If no code block is found, return null
  return null;
}

// A function that calls GPT-4 vision API to transform an image to a JSON structure.
export async function transformImageToJSON<T>(
  imagePath: string,
  prompts: Prompts
): Promise<T> {
  const image = await fs.readFile(imagePath);
  const base64Image = image.toString("base64");
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompts.withImage,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
  });

  if (response.choices.length === 0) {
    throw new Error("No response.choices from GPT-4V");
  }

  if (!response.choices[0]?.message?.content) {
    throw new Error("No response.choices[0]?.message?.content from GPT-4V");
  }

  const code = extractCode(response.choices[0]?.message.content);

  if (!code) {
    throw new Error("No code block found in the response.");
  }

  return JSON.parse(code) as T;
}
