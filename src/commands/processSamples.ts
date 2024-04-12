import { storeRunDetails } from "../services/runDetails";
import { transformImageToJSON } from "../api/vision/openai";
import { logger } from "../logger";
import { Task } from "../models/task.interface";
import { SampleRunDetails, TestSample } from "../models/analysis.interface";
import {
  listAllSamplesInGroup,
  loadSample,
  readSampleContext,
} from "../services/samples";

interface Arguments {
  samples: string[];
  samplesGroup: string;
  runs: number;
}

// Function to process a single sample
async function processSample(sample: TestSample<Task[]>) {
  logger.info(`--- Processing sample: ${sample.sample} ---`);
  const aiPrompt = await readSampleContext(sample);

  let aiResult: Task[] = [];

  logger.info(`- Reading context for image`);
  logger.debug({ aiPrompt }, "Image context read");

  logger.info(`- Transforming image to JSON`);
  aiResult = await transformImageToJSON<Task[]>(sample.sampleImageFullPath, {
    withImage: aiPrompt,
  });
  logger.debug({ aiResult }, "Image transformed to JSON");

  const runDetails: SampleRunDetails<Task[]> = {
    sample: sample.sample,
    sampleGroup: sample.sampleGroup,
    prompt: aiPrompt,
    aiJson: aiResult,
  };

  await storeRunDetails(sample.sampleGroup, sample.sample, runDetails);
}

// Function to process samples in parallel for a given run
async function runSamples(
  samples: TestSample<Task[]>[],
  run: number
): Promise<void[]> {
  logger.info(`--- Starting run ${run} for all samples ---`);
  const samplePromises = samples.map(async (sample) => {
    await processSample(sample);
  });

  return Promise.all(samplePromises);
}

// Function to process all samples based on the provided arguments, including multiple runs
export async function processSamples(args: Arguments) {
  try {
    let samples: TestSample<Task[]>[];
    if (args.samples[0] === "all") {
      samples = await listAllSamplesInGroup<Task[]>(args.samplesGroup);
    } else {
      samples = await Promise.all(
        args.samples.map((sample) =>
          loadSample<Task[]>(sample, args.samplesGroup)
        )
      );
    }

    if (!samples || samples.length === 0) {
      logger.error("No samples found to process.");
      return;
    }

    logger.info(`Process initiated for all samples with runs: ${args.runs}`);

    for (let run = 1; run <= args.runs; run++) {
      // It's recommended to run multiple samples when running multiple runs
      // because we observed that sending the same sample multiple times after each other
      // can lead to a higher chance of getting the same result
      await runSamples(samples, run);
    }

    logger.info(
      "All samples have been processed for the specified number of runs."
    );
  } catch (error) {
    logger.error({ err: error }, "Error processing samples with multiple runs");
  }
}
