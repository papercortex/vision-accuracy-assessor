import {
  MetricAttribute,
  PerformanceMetrics,
} from "../models/metric.interface";
import { Task } from "../models/task.interface";
import { calculateDateMetricForTaskPair } from "./attributes/date";
import { calculateTagsMetricForTaskPair } from "./attributes/tags";
import {
  calculateFromTimeMetricForTaskPair,
  calculateToTimeMetricForTaskPair,
} from "./attributes/time";
import { calculateTitleMetricForTaskPair } from "./attributes/title";
import { matchTasksByTitleSimilarity } from "./utils";

export const attributeWeights: Record<MetricAttribute, number> = {
  date: 3, // Highest weight
  fromTime: 3, // Highest weight
  toTime: 3, // Highest weight
  tags: 2, // High weight
  title: 1, // Default weight
};

// Function to initialize metrics sums with zeros
export function initializeMetricsSums(): Record<
  MetricAttribute,
  PerformanceMetrics
> {
  return {
    date: { precision: 0, recall: 0, f1Score: 0 },
    tags: { precision: 0, recall: 0, f1Score: 0 },
    title: { precision: 0, recall: 0, f1Score: 0 },
    fromTime: { precision: 0, recall: 0, f1Score: 0 },
    toTime: { precision: 0, recall: 0, f1Score: 0 },
  };
}

export function calculateTasksAttributeMetrics(
  aiResponse: Task[],
  expectedResponse: Task[],
  attributes: MetricAttribute[]
): Record<MetricAttribute, PerformanceMetrics> {
  const metrics = initializeMetricsSums();
  let totalWeights = 0;

  // Match tasks based on title similarity to pair them for comparison
  const { matchedPairs } = matchTasksByTitleSimilarity(
    aiResponse,
    expectedResponse
  );

  attributes.forEach((attribute) => {
    let weightedPrecision = 0;
    let weightedRecall = 0;
    let weightedF1Score = 0;
    const weight = attributeWeights[attribute];

    matchedPairs.forEach(([aiTask, expectedTask]) => {
      let attributeMetrics: PerformanceMetrics;

      // Calculate metrics based on the attribute type
      switch (attribute) {
        case "date":
          attributeMetrics = calculateDateMetricForTaskPair(
            aiTask,
            expectedTask
          );
          break;
        case "tags":
          attributeMetrics = calculateTagsMetricForTaskPair(
            aiTask,
            expectedTask
          );
          break;
        case "title":
          attributeMetrics = calculateTitleMetricForTaskPair(
            aiTask,
            expectedTask
          );
          break;
        case "fromTime":
          attributeMetrics = calculateFromTimeMetricForTaskPair(
            aiTask,
            expectedTask
          );
          break;
        case "toTime":
          attributeMetrics = calculateToTimeMetricForTaskPair(
            aiTask,
            expectedTask
          );
          break;
        default:
          throw new Error(`Unknown attribute: ${attribute}`);
      }

      // Accumulate weighted metrics
      weightedPrecision += attributeMetrics.precision * weight;
      weightedRecall += attributeMetrics.recall * weight;
      weightedF1Score += attributeMetrics.f1Score * weight;
    });

    // Compute the total weight applied across all matched pairs for the attribute
    const totalAttributeWeight = weight * matchedPairs.length;
    totalWeights += totalAttributeWeight; // Accumulate total weight for overall metrics calculation

    // Assign averaged metrics to the corresponding attribute
    metrics[attribute] = {
      precision: weightedPrecision / totalAttributeWeight,
      recall: weightedRecall / totalAttributeWeight,
      f1Score: weightedF1Score / totalAttributeWeight,
    };
  });

  return metrics;
}
