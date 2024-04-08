import path from "path";
import {
  listImageFiles,
  readContextForImage,
  readExpectedJsonForImage,
  storeAiAnalysisForImage,
} from "../utils/fileHandler";
import { storeRunAnalysisObject } from "../utils/runAnalysisFileHandler";
import { transformImageToJSON } from "../api/vision/openai";
import {
  calculateMetrics,
  calculateOverallMetrics,
} from "../metrics/calculate";
import { analyzeCalculatedMetrics } from "../api/analysis/openai";
import { logger } from "../logger";
import { Task } from "../models/task.interface";
import { Analysis } from "../models/analysis.interface";

interface Arguments {
  samples: string[];
  samplesGroup: string;
  skipAiAnalysis: boolean;
  runs: number;
}

// Function to process a single sample
async function processSample(
  sample: string,
  samplePath: string,
  args: Arguments
): Promise<Analysis> {
  logger.info(`--- Processing sample: ${sample} ---`);
  const aiPrompt = await readContextForImage(samplePath);

  let aiResult: Task[] = [];

  logger.info(`- Reading context for image: ${sample}`);
  logger.debug({ aiPrompt }, "Image context read");

  logger.info(`- Transforming image to JSON: ${sample}`);
  aiResult = await transformImageToJSON<Task[]>(samplePath, {
    withImage: aiPrompt,
  });
  logger.debug({ aiResult }, "Image transformed to JSON");

  logger.debug({ sample }, "Debug object stored");

  const expectedResponse = await readExpectedJsonForImage(samplePath);
  const metrics = calculateMetrics(aiResult, expectedResponse, [
    "date",
    "fromTime",
    "toTime",
    "title",
    "tags",
  ]);
  const overallMetrics = calculateOverallMetrics(metrics);
  logger.debug({ metrics, overallMetrics }, `Metrics calculated for ${sample}`);

  if (!args.skipAiAnalysis) {
    logger.info(`- Performing AI analysis on metrics for image: ${sample}`);
    const aiAnalysis = await analyzeCalculatedMetrics(metrics, overallMetrics);
    await storeAiAnalysisForImage(
      samplePath,
      metrics,
      overallMetrics,
      aiAnalysis
    );
    logger.info(`AI analysis stored for ${sample}`);
  }

  return {
    fullSamplePath: samplePath,
    metrics,
    overallMetrics,
    prompt: aiPrompt,
    aiTasks: aiResult,
    expectedTasks: expectedResponse,
  };
}

// Function to process samples in parallel for a given run
async function runSamples(
  images: string[],
  args: Arguments,
  run: number
): Promise<void[]> {
  logger.info(`--- Starting run ${run} for all samples ---`);
  const samplePromises = images.map(async (image) => {
    const sample = path.basename(image).replace(/\.[^/.]+$/, "");
    logger.info(`Processing sample: ${sample} for run ${run}`);
    const analysis = await processSample(sample, image, args);
    await storeRunAnalysisObject(args.samplesGroup, sample, analysis);
  });

  return Promise.all(samplePromises);
}

// Function to process all samples based on the provided arguments, including multiple runs
export async function processSamples(args: Arguments) {
  try {
    logger.info(`Process initiated for all samples with runs: ${args.runs}`);
    const samplesDir = path.join(process.cwd(), "samples", args.samplesGroup);
    const images = await listImageFiles(samplesDir, args.samples);

    for (let run = 1; run <= args.runs; run++) {
      // It's recommended to run multiple samples when running multiple runs
      // because we observed that sending the same sample multiple times after each other
      // can lead to a higher chance of getting the same result
      await runSamples(images, args, run);
    }

    logger.info(
      "All samples have been processed for the specified number of runs."
    );
  } catch (error) {
    logger.error({ err: error }, "Error processing samples with multiple runs");
  }
}
