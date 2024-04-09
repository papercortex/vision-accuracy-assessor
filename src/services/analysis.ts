import { calculateTasksAttributeMetrics } from "../metrics/calculateTasksAttributeMetrics";
import { calculateWeightedMetrics } from "../metrics/calculateWeightedMetrics";
import { calculateAggregatedAttributesForMultipleRuns } from "../metrics/calculateAggregatedAttributesForMultipleRuns";
import {
  SampleAnalysis,
  SampleRunAnalysis,
  SampleRunDetails,
  TestSample,
} from "../models/analysis.interface";
import { Task } from "../models/task.interface";
import { loadAllRunDetailsForSample } from "./runDetails";
import { calculateTaskLevelMetrics } from "../metrics/calculateTaskLevelMetrics";
import { calculateAverageMetrics } from "../metrics/calculateAverageMetrics";
import { taskAttributeWeights, taskLevelWeight } from "../metrics/constants";

export async function analyze<T>(
  sample: TestSample<T>
): Promise<SampleAnalysis<T>> {
  const runs: Record<
    string,
    SampleRunDetails<T>
  > = await loadAllRunDetailsForSample(sample.sampleGroup, sample.sample);

  if (!sample.expectedJson) {
    throw new Error(
      `Expected JSON not found for sample: ${sample.sample} in group: ${sample.sampleGroup}`
    );
  }

  const analyzedRuns: Record<string, SampleRunAnalysis<T>> = Object.entries(
    runs
  ).reduce((acc, [timestamp, run]) => {
    const aiResponse = run.aiJson as Task[];
    const expectedResponse = sample.expectedJson as Task[];
    const attributeMetrics = calculateTasksAttributeMetrics(
      aiResponse,
      expectedResponse,
      ["date", "fromTime", "toTime", "title", "tags"]
    );

    const taskLevelMetrics = calculateTaskLevelMetrics(
      aiResponse,
      expectedResponse
    );

    acc[timestamp] = {
      details: run,
      attributeMetrics,
      taskLevelMetrics,
      weightedAggregateMetrics: calculateWeightedMetrics(
        attributeMetrics,
        taskAttributeWeights,
        taskLevelMetrics,
        taskLevelWeight
      ),
    };
    return acc;
  }, {} as Record<string, SampleRunAnalysis<T>>);

  const aggregatedAttributesMetrics =
    calculateAggregatedAttributesForMultipleRuns(analyzedRuns);

  return {
    sample: sample.sample,
    sampleGroup: sample.sampleGroup,
    runs: analyzedRuns,
    overallWeightedMetrics: calculateAverageMetrics(
      Object.values(analyzedRuns).map((run) => run.weightedAggregateMetrics)
    ),
    averageAttributeMetrics: aggregatedAttributesMetrics,
    overallTaskLevelMetrics: calculateAverageMetrics(
      Object.values(analyzedRuns).map((run) => run.taskLevelMetrics)
    ),
  };
}
