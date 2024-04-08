import fs from "fs/promises";
import path from "path";
import { Analysis } from "../models/analysis.interface";
import { logger } from "../logger";

const analysisDir = path.join(process.cwd(), `analysis`);

export async function storeRunAnalysisObject(
  sampleGroup: string,
  sample: string,
  object: Analysis
) {
  try {
    await fs.mkdir(path.join(analysisDir, sampleGroup, sample), {
      recursive: true,
    });
  } catch (error) {
    // Handle potential errors, for example logging them
    console.error("Error creating directory:", error);
  }
  const ts = new Date().getTime();
  await fs.writeFile(
    path.join(analysisDir, sampleGroup, sample, `${ts}.json`),
    JSON.stringify(object, null, 2)
  );
}

export async function removeRunAnalysisObject(
  sampleGroup: string,
  sample: string,
  timestamp: number | string
) {
  try {
    await fs.unlink(
      path.join(analysisDir, sampleGroup, sample, `${timestamp}.json`)
    );
  } catch (error) {
    // Handle potential errors, for example logging them
    console.error("Error removing file:", error);
  }
}

export async function loadRunAnalysisObject(
  sampleGroup: string,
  sample: string,
  timestamp: number
): Promise<Analysis | null> {
  const filePath = path.join(
    analysisDir,
    sampleGroup,
    sample,
    `${timestamp}.json`
  );
  try {
    const file = await fs.readFile(filePath, { encoding: "utf-8" });
    return JSON.parse(file);
  } catch (error) {
    logger.debug("Error reading directory:", error);
    return null;
  }
}

// Returns a map of timestamp to Analysis object
export async function loadAllRunAnalysisObjects(
  sampleGroup: string,
  sample: string
): Promise<Record<string, Analysis>> {
  const dirPath = path.join(analysisDir, sampleGroup, sample);
  try {
    const files = await fs.readdir(dirPath);
    const analysisObjects = await Promise.all(
      files.map(async (file) => {
        const timestamp = parseInt(file.replace(".json", ""));
        return [
          timestamp,
          await loadRunAnalysisObject(sampleGroup, sample, timestamp),
        ];
      })
    );
    return Object.fromEntries(analysisObjects);
  } catch (error) {
    logger.debug("Error reading directory:", error);
    return {};
  }
}
