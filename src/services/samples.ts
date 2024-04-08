import fs from "fs/promises";
import path from "path";
import { TestSample } from "../models/analysis.interface";
import { logger } from "../logger";

export async function listAllSamplesInGroup<T>(
  sampleGroup: string
): Promise<TestSample<T>[]> {
  const samplesDir = path.join(process.cwd(), "samples", sampleGroup);
  const files = await fs.readdir(samplesDir);
  const sampleNames = files
    .filter((file) => file.match(/\.png$/i))
    .map((file) => file.replace(/\.png$/i, ""));

  const promises = sampleNames.map((sample) =>
    loadSample<T>(sample, sampleGroup)
  );
  return Promise.all(promises);
}

export async function loadSample<T>(
  sample: string,
  sampleGroup: string
): Promise<TestSample<T>> {
  const samplesDir = path.join(process.cwd(), "samples", sampleGroup);
  const expectedJsonPath = path.join(samplesDir, `${sample}.json`);
  let expectedJson: T | null = null;

  try {
    expectedJson = require(expectedJsonPath);
  } catch (error) {
    logger.warn("Sample expected JSON not found. continuing without it.");
    expectedJson = null;
  }
  return {
    sample,
    sampleGroup,
    sampleImageFullPath: path.join(samplesDir, `${sample}.png`),
    expectedJson,
  };
}

function addPlaceholdersToContext(context: string) {
  const currentDate = new Date().toISOString().split("T")[0];
  if (!currentDate) {
    throw new Error("Failed to get the current date.");
  }
  return context.replaceAll("{{currentDate}}", currentDate);
}

export async function readSampleContext<T>(sample: TestSample<T>) {
  const samplesRoot = await fs.readFile(
    path.join(process.cwd(), "samples", "context"),
    "utf-8"
  );
  const sampleRoot = await fs.readFile(
    path.join(process.cwd(), "samples", sample.sampleGroup, "context"),
    "utf-8"
  );
  return [samplesRoot, sampleRoot].map(addPlaceholdersToContext).join("\n");
}
