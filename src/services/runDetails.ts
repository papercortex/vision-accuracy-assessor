import fs from "fs/promises";
import path from "path";
import { SampleRunDetails } from "../models/analysis.interface";
import { logger } from "../logger";

const analysisDir = path.join(process.cwd(), `executions`);

export async function storeRunDetails<T>(
  sampleGroup: string,
  sample: string,
  object: SampleRunDetails<T>
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

export async function removeRunDetails(
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

export async function loadRunDetails<T>(
  sampleGroup: string,
  sample: string,
  timestamp: number
): Promise<SampleRunDetails<T> | null> {
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

export async function loadAllRunDetailsForSample<T>(
  sampleGroup: string,
  sample: string
): Promise<Record<string, SampleRunDetails<T>>> {
  const dirPath = path.join(analysisDir, sampleGroup, sample);
  try {
    const files = await fs.readdir(dirPath);
    const analysisObjects = await Promise.all(
      files.map(async (file) => {
        const timestamp = parseInt(file.replace(".json", ""));
        return [
          timestamp,
          await loadRunDetails(sampleGroup, sample, timestamp),
        ];
      })
    );
    return Object.fromEntries(analysisObjects);
  } catch (error) {
    logger.debug("Error reading directory:", error);
    return {};
  }
}
