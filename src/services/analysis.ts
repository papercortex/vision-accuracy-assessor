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
    const attributeMetrics = calculateTasksAttributeMetrics(
      run.aiJson as Task[],
      sample.expectedJson as Task[],
      ["date", "fromTime", "toTime", "title", "tags"]
    );
    acc[timestamp] = {
      details: run,
      attributeMetrics,
      weightedAggregateMetrics: calculateWeightedMetrics(attributeMetrics),
    };
    return acc;
  }, {} as Record<string, SampleRunAnalysis<T>>);

  const aggregatedAttributesMetrics =
    calculateAggregatedAttributesForMultipleRuns(analyzedRuns);

  return {
    sample: sample.sample,
    sampleGroup: sample.sampleGroup,
    runs: analyzedRuns,
    overallWeightedMetrics: calculateWeightedMetrics(
      aggregatedAttributesMetrics
    ),
    averageAttributeMetrics: aggregatedAttributesMetrics,
  };
}
