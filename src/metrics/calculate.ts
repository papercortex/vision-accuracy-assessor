import { distance } from "fastest-levenshtein";
import {
  MetricAttribute,
  Metrics,
  OverallMetrics,
} from "../models/metric.interface";
import { Task } from "../models/task.interface";
import { calculateDateMetricForTaskPair } from "./attributes/date";
import { calculateTagsMetricForTaskPair } from "./attributes/tags";
import {
  calculateFromTimeMetricForTaskPair,
  calculateToTimeMetricForTaskPair,
} from "./attributes/time";
import { calculateTitleMetricForTaskPair } from "./attributes/title";

export const attributeWeights: Record<MetricAttribute, number> = {
  date: 3, // Highest weight
  fromTime: 3, // Highest weight
  toTime: 3, // Highest weight
  tags: 2, // High weight
  title: 1, // Default weight
};

function matchTasksByTitleSimilarity(
  aiResponse: Task[],
  expectedResponse: Task[]
): [Task, Task][] {
  const matchedPairs: [Task, Task][] = [];

  expectedResponse.forEach((expectedTask) => {
    let bestMatch: Task | null = null;
    let highestSimilarity = 0;

    aiResponse.forEach((aiTask) => {
      const similarity = calculateTitleSimilarity(
        aiTask.title,
        expectedTask.title
      );
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = aiTask;
      }
    });

    if (bestMatch) {
      matchedPairs.push([bestMatch, expectedTask]);
    }
  });

  return matchedPairs;
}

// Simple similarity measure for titles (could be replaced with a more sophisticated algorithm)
function calculateTitleSimilarity(
  aiTitle: string,
  expectedTitle: string
): number {
  const similarity =
    1 -
    distance(aiTitle, expectedTitle) /
      Math.max(aiTitle.length, expectedTitle.length);
  return similarity; // Returns a value between 0 and 1
}

export function calculateMetrics(
  aiResponse: Task[],
  expectedResponse: Task[],
  attributes: MetricAttribute[]
): Record<MetricAttribute, Metrics> {
  const metrics: Record<MetricAttribute, Metrics> = {
    date: { precision: 0, recall: 0, f1Score: 0 },
    tags: { precision: 0, recall: 0, f1Score: 0 },
    title: { precision: 0, recall: 0, f1Score: 0 },
    fromTime: { precision: 0, recall: 0, f1Score: 0 },
    toTime: { precision: 0, recall: 0, f1Score: 0 },
  };
  let totalWeights = 0;

  // Match tasks based on title similarity to pair them for comparison
  const matchedPairs = matchTasksByTitleSimilarity(
    aiResponse,
    expectedResponse
  );

  attributes.forEach((attribute) => {
    let weightedPrecision = 0;
    let weightedRecall = 0;
    let weightedF1Score = 0;
    const weight = attributeWeights[attribute];

    matchedPairs.forEach(([aiTask, expectedTask]) => {
      let attributeMetrics: Metrics;

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

export function calculateOverallMetrics(
  metrics: Record<MetricAttribute, Metrics>
): OverallMetrics {
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
    totalAttributes: Object.keys(metrics).length,
    attributeWeights,
  };
}
