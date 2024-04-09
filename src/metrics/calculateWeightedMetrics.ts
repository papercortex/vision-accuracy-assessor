import {
  MetricAttribute,
  PerformanceMetrics,
} from "../models/metric.interface";

export function calculateWeightedMetrics(
  attributesMetrics: Record<MetricAttribute, PerformanceMetrics>,
  attributeWeights: Record<MetricAttribute, number>,
  taskLevelMetrics: PerformanceMetrics,
  taskLevelWeight: number
): PerformanceMetrics {
  let totalPrecision = 0;
  let totalRecall = 0;
  let totalF1Score = 0;
  let totalWeights = 0;

  // Sum the metrics across all attributes, taking into account their weights
  // @ts-ignore
  Object.keys(attributesMetrics).forEach((attribute: MetricAttribute) => {
    const attributeWeight = attributeWeights[attribute];
    const attributeMetrics = attributesMetrics[attribute];

    totalPrecision += attributeMetrics.precision * attributeWeight;
    totalRecall += attributeMetrics.recall * attributeWeight;
    totalF1Score += attributeMetrics.f1Score * attributeWeight;
    totalWeights += attributeWeight;
  });

  // Include task-level metrics in the weighted sum
  totalPrecision += taskLevelMetrics.precision * taskLevelWeight;
  totalRecall += taskLevelMetrics.recall * taskLevelWeight;
  totalF1Score += taskLevelMetrics.f1Score * taskLevelWeight;
  totalWeights += taskLevelWeight;

  // Calculate overall metrics as weighted averages
  return {
    precision: totalPrecision / totalWeights,
    recall: totalRecall / totalWeights,
    f1Score: totalF1Score / totalWeights,
  };
}
