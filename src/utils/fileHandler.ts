import fs from "fs/promises";
import path from "path";
import {
  MetricAttribute,
  Metrics,
  OverallMetrics,
} from "../models/metric.interface";
import { Task } from "../models/task.interface";

type ImageFile = string;

// Samples can be found in ./samples/{sampleGroup}/{sample}.json
async function listAllSamplesInGroup(sampleGroup: string): Promise<string[]> {
  const samplesDir = path.join(process.cwd(), "samples", sampleGroup);
  try {
    const files = await fs.readdir(samplesDir);
    return files
      .filter((file) => file.match(/\.json$/i))
      .map((file) => file.replace(/\.json$/i, ""));
  } catch (error) {
    console.error(`Error listing samples in group ${sampleGroup}:`, error);
    throw error;
  }
}

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

async function readExpectedJsonForImage(
  sampleGroup: string,
  sample: string
): Promise<Task[]> {
  const samplesDir = path.join(process.cwd(), "samples", sampleGroup);
  const jsonPath = path.join(samplesDir, `${sample}.json`);
  try {
    const jsonData = await fs.readFile(jsonPath, { encoding: "utf8" });
    return JSON.parse(jsonData);
  } catch (error) {
    console.error(`Error reading expected JSON for image ${jsonPath}:`, error);
    throw error;
  }
}

function addPlaceholdersToContext(context: string) {
  const currentDate = new Date().toISOString().split("T")[0];
  if (!currentDate) {
    throw new Error("Failed to get the current date.");
  }
  return context.replaceAll("{{currentDate}}", currentDate);
}

async function readContextForImage(imagePath: string) {
  const parentDir = path.dirname(imagePath);
  const grandParentDir = path.dirname(parentDir);
  const parentCtx = await fs.readFile(path.join(parentDir, "context"), "utf-8");
  const grandParentCtx = await fs.readFile(
    path.join(grandParentDir, "context"),
    "utf-8"
  );
  return [grandParentCtx, parentCtx].map(addPlaceholdersToContext).join("\n");
}

async function storeAiAnalysisForImage(
  imagePath: string,
  metrics: Record<MetricAttribute, Metrics>,
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
  const fullAnalysis = `# Analysis for ${imageName}\n\n## Metrics\n\n\`\`\`json\n${JSON.stringify(
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
  listAllSamplesInGroup,
  listImageFiles,
  readExpectedJsonForImage,
  readContextForImage,
  storeAiAnalysisForImage,
};
