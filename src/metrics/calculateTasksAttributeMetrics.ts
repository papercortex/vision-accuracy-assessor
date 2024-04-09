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

  // Match tasks based on title similarity to pair them for comparison
  const { matchedPairs } = matchTasksByTitleSimilarity(
    aiResponse,
    expectedResponse
  );

  attributes.forEach((attribute) => {
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

      // Accumulate base metrics
      metrics[attribute].precision += attributeMetrics.precision;
      metrics[attribute].recall += attributeMetrics.recall;
      metrics[attribute].f1Score += attributeMetrics.f1Score;
    });

    // Average the metrics for each attribute
    metrics[attribute].precision /= matchedPairs.length;
    metrics[attribute].recall /= matchedPairs.length;
    metrics[attribute].f1Score /= matchedPairs.length;
  });

  return metrics;
}
