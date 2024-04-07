import fs from "fs/promises";
import path from "path";
import { Metrics, OverallMetrics } from "../metrics/calculate";

type ImageFile = string;
type ExpectedOutput = any; // Adjust based on your actual expected output structure

/**
 * @param directoryPath Path to the directory containing sample images.
 * @returns A promise that resolves to an array of image file paths.
 */
async function listImageFiles(
  directoryPath: string,
  samples: string[]
): Promise<ImageFile[]> {
  try {
    const files = await fs.readdir(directoryPath);
    const images = files.filter((file) => {
      return (
        file.match(/\.(jpg|jpeg|png|gif)$/i) &&
        samples.includes(file.replace(/\.(jpg|jpeg|png|gif)$/i, ""))
      );
    });
    return images.map((image) => path.join(directoryPath, image));
  } catch (error) {
    console.error(
      `Error listing image files from directory ${directoryPath}:`,
      error
    );
    throw error;
  }
}

/**
 * Asynchronously reads the expected JSON output for a given image file.
 *
 * @param imagePath Path to the image file.
 * @returns A promise that resolves to the expected JSON output.
 */
async function readExpectedJsonForImage(
  imagePath: string
): Promise<ExpectedOutput> {
  const jsonPath = imagePath.replace(/\.(jpg|jpeg|png|gif)$/i, ".json");
  try {
    const jsonData = await fs.readFile(jsonPath, { encoding: "utf8" });
    return JSON.parse(jsonData);
  } catch (error) {
    console.error(`Error reading expected JSON for image ${imagePath}:`, error);
    throw error;
  }
}

async function readContextForImage(imagePath: string) {
  const parentDir = path.dirname(imagePath);
  const grandParentDir = path.dirname(parentDir);
  const parentCtx = await fs.readFile(path.join(parentDir, "context"), "utf-8");
  const grandParentCtx = await fs.readFile(
    path.join(grandParentDir, "context"),
    "utf-8"
  );
  return `${grandParentCtx}\n${parentCtx}`;
}

async function storeAiAnalysisForImage(
  imagePath: string,
  metrics: Record<string, Metrics>,
  overallMetrics: OverallMetrics,
  aiAnalysis: string
) {
  // Image name without extension
  const imageName = path
    .basename(imagePath)
    .replace(/\.(jpg|jpeg|png|gif)$/i, "");
  console.log(imageName);
  const fileTs = new Date().getTime();
  const analysisPath = imagePath
    .replace(/\.(jpg|jpeg|png|gif)$/i, `_${fileTs}.md`)
    .replace("samples", "ai_analysis");
  const fullAnalysis = `# AI Analysis for ${imageName}\n\n## Metrics\n\n\`\`\`json\n${JSON.stringify(
    metrics,
    null,
    2
  )}\n\`\`\`\n\n## Overall Metrics\n\n\`\`\`json\n${JSON.stringify(
    overallMetrics,
    null,
    2
  )}\n\`\`\`\n\n## AI Analysis\n\n${aiAnalysis}`;
  try {
    await fs.writeFile(analysisPath, fullAnalysis, {
      encoding: "utf8",
    });
  } catch (error) {
    console.error(`Error storing AI analysis for image ${imagePath}:`, error);
    throw error;
  }
}

export {
  listImageFiles,
  readExpectedJsonForImage,
  readContextForImage,
  storeAiAnalysisForImage,
};
