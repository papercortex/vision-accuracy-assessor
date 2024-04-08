import path from "path";
import { logger } from "../logger";
import {
  loadAllRunAnalysisObjects,
  removeRunAnalysisObject,
  storeRunAnalysisObject,
} from "../utils/runAnalysisFileHandler";
import {
  calculateMetrics,
  calculateOverallMetrics,
} from "../metrics/calculate";
import { Analysis } from "../models/analysis.interface";
import { readExpectedJsonForImage } from "../utils/fileHandler";

interface Arguments {
  samplesGroup: string;
  samples: string[];
}

export async function recalculateSampleMetrics(
  sampleGroup: string,
  sample: string
) {
  const expectedTasks = await readExpectedJsonForImage(sampleGroup, sample);
  const allRuns = await loadAllRunAnalysisObjects(sampleGroup, sample);

  await Object.keys(allRuns).reduce(async (acc, timestamp) => {
    await acc;
    const run = allRuns[timestamp] as Analysis;
    const { aiTasks } = run;

    const metrics = calculateMetrics(aiTasks, expectedTasks, [
      "date",
      "fromTime",
      "toTime",
      "title",
      "tags",
    ]);
    const overallMetrics = calculateOverallMetrics(metrics);

    logger.debug(
      { metrics, overallMetrics },
      `- Metrics recalculated for ${sample}`
    );

    run.metrics = metrics;
    run.overallMetrics = overallMetrics;

    logger.info(`- Removing old metrics for ${sample}`);
    await removeRunAnalysisObject(sampleGroup, sample, timestamp);
    logger.info(`- Storing recalculated metrics for ${sample}`);
    await storeRunAnalysisObject(sampleGroup, sample, run);
  }, Promise.resolve());
}

export async function recalculateMetrics(args: Arguments) {
  for (const sample of args.samples) {
    logger.info(`Recalculating metrics for sample: ${sample}`);
    await recalculateSampleMetrics(args.samplesGroup, sample);
    logger.info(`Recalculated metrics for sample: ${sample}`);
  }
}
