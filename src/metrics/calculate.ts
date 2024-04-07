import { Task } from "../models/task.interface";

export interface OverallMetrics extends Metrics {
  totalAttributes: number;
}

export interface Metrics {
  precision: number;
  recall: number;
  f1Score: number;
}

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
  const aiWords = aiTitle.toLowerCase().split(/\s+/);
  const expectedWords = expectedTitle.toLowerCase().split(/\s+/);
  const matchingWords = expectedWords.filter((word) => aiWords.includes(word));
  const similarity = matchingWords.length / expectedWords.length;
  return similarity; // Returns a value between 0 and 1
}

function calculateDateMetricForTaskPair(
  aiTask: Task,
  expectedTask: Task
): Metrics {
  const precision = aiTask.date === expectedTask.date ? 1 : 0;
  const recall = expectedTask.date !== "" ? precision : 1; // If there's an expected date, recall depends on precision; otherwise, it's perfect by default.
  const f1Score = (2 * precision * recall) / (precision + recall) || 0; // Avoid division by zero

  return { precision, recall, f1Score };
}

function calculateTagsMetricForTaskPair(
  aiTask: Task,
  expectedTask: Task
): Metrics {
  // Convert tags to sets for unordered comparison
  const aiTagsSet = new Set(aiTask.tags);
  const expectedTagsSet = new Set(expectedTask.tags);

  // Calculate matching tags by intersecting the sets
  const matchingTagsCount = [...expectedTagsSet].filter((tag) =>
    aiTagsSet.has(tag)
  ).length;
  const totalExpectedTags = expectedTagsSet.size;
  const totalAiTags = aiTagsSet.size;

  if (totalExpectedTags === 0 && totalAiTags === 0) {
    // If both sets are empty, consider the match perfect
    return { precision: 1, recall: 1, f1Score: 1 };
  }

  // Precision and recall calculations are based on the size of the sets
  const precision = totalAiTags > 0 ? matchingTagsCount / totalAiTags : 0; // How many of AI's tags were correct
  const recall =
    totalExpectedTags > 0 ? matchingTagsCount / totalExpectedTags : 0; // How many of the expected tags were found in AI's tags

  // Calculate F1 score, which is the harmonic mean of precision and recall
  const f1Score =
    precision + recall > 0
      ? (2 * precision * recall) / (precision + recall)
      : 0;

  return { precision, recall, f1Score };
}

function calculateTimeMetricForTaskPair(
  aiTask: Task,
  expectedTask: Task
): Metrics {
  const fromTimeMatch = aiTask.fromTime === expectedTask.fromTime ? 1 : 0;
  const toTimeMatch = aiTask.toTime === expectedTask.toTime ? 1 : 0;
  const correctMatches = fromTimeMatch + toTimeMatch;
  const precision = correctMatches / 2; // Since there are two time points (from and to)
  const recall = expectedTask.fromTime && expectedTask.toTime ? precision : 1; // If expected times are provided, recall matches precision; otherwise, it's perfect.
  const f1Score = (2 * precision * recall) / (precision + recall) || 0;

  return { precision, recall, f1Score };
}

function calculateTitleMetricForTaskPair(
  aiTask: Task,
  expectedTask: Task
): Metrics {
  // Assuming calculateTitleSimilarity returns a value between 0 (no match) and 1 (perfect match)
  const titleSimilarity = calculateTitleSimilarity(
    aiTask.title,
    expectedTask.title
  );

  // Here, precision and recall concepts are a bit merged due to the direct comparison nature.
  // Since we're evaluating a similarity score, consider both precision and recall as equal to the similarity score.
  // This reflects the idea that our "correctness" in title matching is directly tied to how similar the titles are.
  const precision = titleSimilarity; // How precise our title match is.
  const recall = titleSimilarity; // How well we are capturing the expected title's essence.

  // Calculate F1 Score based on precision and recall. In this context, it's essentially reaffirming the similarity score.
  const f1Score = (2 * precision * recall) / (precision + recall) || 0;

  return { precision, recall, f1Score };
}

export function calculateMetrics(
  aiResponse: Task[],
  expectedResponse: Task[],
  attributes: ("date" | "tags" | "title" | "time")[]
): Record<string, Metrics> {
  const metrics: Record<string, Metrics> = {};

  // Match tasks based on title similarity
  const matchedPairs = matchTasksByTitleSimilarity(
    aiResponse,
    expectedResponse
  );

  attributes.forEach((attribute) => {
    let totalPrecision = 0;
    let totalRecall = 0;
    let totalF1Score = 0;

    // @ts-ignore
    matchedPairs.forEach(([aiTask, expectedTask]) => {
      let attributeMetrics: Metrics;

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
        case "time":
          attributeMetrics = calculateTimeMetricForTaskPair(
            aiTask,
            expectedTask
          );
          break;
        default:
          throw new Error(`Unknown attribute: ${attribute}`);
      }

      // Aggregate metrics for the current attribute
      totalPrecision += attributeMetrics.precision;
      totalRecall += attributeMetrics.recall;
      totalF1Score += attributeMetrics.f1Score;
    });

    // Calculate average metrics for the current attribute across all matched pairs
    const avgPrecision = totalPrecision / matchedPairs.length;
    const avgRecall = totalRecall / matchedPairs.length;
    const avgF1Score = totalF1Score / matchedPairs.length;

    // Assign averaged metrics to the corresponding attribute
    metrics[attribute] = {
      precision: avgPrecision,
      recall: avgRecall,
      f1Score: avgF1Score,
    };
  });

  return metrics;
}

export function calculateOverallMetrics(
  metrics: Record<string, Metrics>
): OverallMetrics {
  let totalPrecision = 0;
  let totalRecall = 0;
  let totalF1Score = 0;
  let attributesCounted = 0;

  Object.values(metrics).forEach((metric) => {
    totalPrecision += metric.precision;
    totalRecall += metric.recall;
    totalF1Score += metric.f1Score;
    attributesCounted++;
  });

  // Calculate averages
  const avgPrecision =
    attributesCounted > 0 ? totalPrecision / attributesCounted : 0;
  const avgRecall = attributesCounted > 0 ? totalRecall / attributesCounted : 0;
  const avgF1Score =
    attributesCounted > 0 ? totalF1Score / attributesCounted : 0;

  return {
    precision: avgPrecision,
    recall: avgRecall,
    f1Score: avgF1Score,
    totalAttributes: attributesCounted,
  };
}
