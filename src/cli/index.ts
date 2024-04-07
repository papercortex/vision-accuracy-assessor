import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  listImageFiles,
  readContextForImage,
  readExpectedJsonForImage,
  storeAiAnalysisForImage,
} from "../utils/fileHandler";
import path from "path";
import { transformImageToJSON } from "../api/vision/openai";
import { loadDebugObject, storeDebugObject } from "../utils/debug";
import {
  calculateMetrics,
  calculateOverallMetrics,
} from "../metrics/calculate";
import { analyzeCalculatedMetrics } from "../api/analysis/openai";
import { logger } from "../logger"; // Import the logger

interface Arguments {
  samples: string[];
  samplesGroup: string;
  onlyMetrics: boolean;
  skipAiAnalysis: boolean;
}

const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 --samples <samples>")
  .option("samples-group", {
    describe: "Samples group to search for in the directory",
    type: "string",
    demandOption: true,
  })
  .option("samples", {
    alias: "s",
    describe: "Comma-separated list of sample dates to process",
    type: "string",
    demandOption: true,
    array: true,
  })
  .option("only-metrics", {
    describe: "Only calculate metrics for the samples",
    type: "boolean",
    default: false,
  })
  .option("skip-ai-analysis", {
    describe: "Skip AI analysis for the samples",
    type: "boolean",
    default: false,
  })
  .help("h")
  .alias("h", "help")
  .parse();

async function processSamples(args: Arguments) {
  try {
    logger.info("Process initiated");
    const samplesDir = path.join(process.cwd(), "samples", args.samplesGroup);
    logger.info({ samplesDir }, "Samples directory set");

    const images = await listImageFiles(samplesDir, args.samples);
    logger.debug({ images }, "Images listed for processing");

    const aiResult = await images.reduce(async (previousPromise, image) => {
      const prevResult = await previousPromise;

      logger.debug({ image }, "Processing image");
      const imageName = path.basename(image);

      if (args.onlyMetrics) {
        return {
          ...prevResult,
          [imageName]: await loadDebugObject(imageName),
        };
      }

      const context = await readContextForImage(image);
      logger.debug({ context }, "Image context read");

      const result = await transformImageToJSON(image, { withImage: context });
      logger.debug({ result }, "Image transformed to JSON");

      await storeDebugObject(imageName, result);
      logger.debug({ imageName }, "Debug object stored");

      return {
        ...prevResult,
        [imageName]: result,
      };
    }, Promise.resolve({}));
    logger.info("Image processing completed");

    logger.info("Starting metrics calculation");
    const metricsResults = await images.reduce(async (prevPromise, image) => {
      const prevResult = await prevPromise;
      const expectedResponse = await readExpectedJsonForImage(image);
      logger.debug(
        { expectedResponse },
        `Expected response for ${path.basename(image)}`
      );

      const imageName = path.basename(image);
      // @ts-ignore
      const metrics = calculateMetrics(aiResult[imageName], expectedResponse, [
        "title",
        "time",
        "date",
        "tags",
      ]);
      logger.debug({ metrics }, "Metrics calculated");

      const overallMetrics = calculateOverallMetrics(metrics);
      logger.debug({ overallMetrics }, "Overall metrics calculated");

      return {
        ...prevResult,
        [imageName]: {
          metrics,
          overallMetrics,
        },
      };
    }, Promise.resolve({}));
    logger.info("Metrics calculation completed");

    if (args.skipAiAnalysis) {
      logger.info("Skipping AI analysis");
      return;
    }

    logger.info("Analyzing calculated metrics with AI");
    for (const image of images) {
      const imageName = path.basename(image);
      // @ts-ignore
      const { metrics, overallMetrics } = metricsResults[imageName];
      if (!metrics || !overallMetrics) {
        logger.error(`Missing metrics for image: ${imageName}`);
        continue;
      }

      const aiAnalysis = await analyzeCalculatedMetrics(
        metrics,
        overallMetrics
      );
      logger.debug({ aiAnalysis }, `AI analysis completed for ${imageName}`);

      await storeAiAnalysisForImage(image, metrics, overallMetrics, aiAnalysis);
      logger.info(`AI analysis stored for ${imageName}`);
    }
    logger.info("All AI analyses have been completed and stored.");
  } catch (error) {
    logger.error({ err: error }, "Error processing samples");
  }
}

// @ts-ignore
processSamples(argv);
