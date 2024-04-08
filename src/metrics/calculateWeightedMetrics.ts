import {
  MetricAttribute,
  PerformanceMetrics,
} from "../models/metric.interface";
import { attributeWeights } from "./calculateTasksAttributeMetrics";

export function calculateWeightedMetrics(
  metrics: Record<MetricAttribute, PerformanceMetrics>
): PerformanceMetrics {
  let totalPrecision = 0;
  let totalRecall = 0;
  let totalF1Score = 0;
  let totalAttributeWeights = 0;

  // Sum the metrics across all attributes, taking into account their weights
  // @ts-ignore
  Object.keys(metrics).forEach((attribute: MetricAttribute) => {
    const weight = attributeWeights[attribute];
    const attributeMetrics = metrics[attribute];
    const attributeWeight = weight; // For simplicity, assuming 1 matched pair per attribute

    totalPrecision += attributeMetrics.precision * attributeWeight;
    totalRecall += attributeMetrics.recall * attributeWeight;
    totalF1Score += attributeMetrics.f1Score * attributeWeight;
    totalAttributeWeights += attributeWeight;
  });

  // Calculate overall metrics as weighted averages
  return {
    precision: totalPrecision / totalAttributeWeights,
    recall: totalRecall / totalAttributeWeights,
    f1Score: totalF1Score / totalAttributeWeights,
  };
}
