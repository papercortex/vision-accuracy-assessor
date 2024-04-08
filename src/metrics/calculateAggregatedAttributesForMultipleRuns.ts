import {
  MetricAttribute,
  PerformanceMetrics,
} from "../models/metric.interface";
import { SampleRunAnalysis } from "../models/analysis.interface";
import { initializeMetricsSums } from "./calculateTasksAttributeMetrics";

export function calculateAggregatedAttributesForMultipleRuns<T>(
  runs: Record<string, SampleRunAnalysis<T>>
): Record<MetricAttribute, PerformanceMetrics> {
  let metricsSums = initializeMetricsSums();
  let numberOfRuns = Object.keys(runs).length; // Tracking the number of runs for average calculation

  // Sum metrics for each run
  Object.values(runs).forEach((run: SampleRunAnalysis<T>) => {
    Object.entries(run.attributeMetrics).forEach(
      ([attribute, { precision, recall, f1Score }]) => {
        const attr: MetricAttribute = attribute as MetricAttribute;
        metricsSums[attr].precision += precision;
        metricsSums[attr].recall += recall;
        metricsSums[attr].f1Score += f1Score;
      }
    );
  });

  // Calculate averages and populate the table
  const averages: Record<MetricAttribute, PerformanceMetrics> =
    initializeMetricsSums();

  Object.entries(metricsSums).forEach(([attribute, metrics]) => {
    const attr = attribute as MetricAttribute;
    averages[attr].precision = metrics.precision / numberOfRuns;
    averages[attr].recall = metrics.recall / numberOfRuns;
    averages[attr].f1Score = metrics.f1Score / numberOfRuns;
  });

  return averages;
}
