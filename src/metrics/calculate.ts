import { Task } from "../models/task.interface";

export interface OverallMetrics extends Metrics {
  totalAttributes: number;
}

export interface Metrics {
  precision: number;
  recall: number;
  f1Score: number;
}

function calculateDateMetrics(
  aiResponse: Task[],
  expectedResponse: Task[]
): Metrics {
  const correctMatches = aiResponse.filter(
    (aiTask, index) => aiTask.date === expectedResponse[index]?.date
  ).length;
  const precision = correctMatches / aiResponse.length;
  const recall = correctMatches / expectedResponse.length;
  const f1Score = (2 * (precision * recall)) / (precision + recall) || 0; // Avoid division by zero

  return { precision, recall, f1Score };
}

function calculateTagsMetrics(
  aiResponse: Task[],
  expectedResponse: Task[]
): Metrics {
  // Assuming a simple presence check for each tag in the expected response
  let correctMatches = 0;
  let totalExpectedTags = 0;

  aiResponse.forEach((aiTask, index) => {
    const expectedTags = expectedResponse[index]?.tags || [];
    totalExpectedTags += expectedTags.length;
    const matchingTags = aiTask.tags.filter((tag) =>
      expectedTags.includes(tag)
    ).length;
    correctMatches += matchingTags;
  });

  const precision =
    correctMatches /
    aiResponse.reduce((acc, curr) => acc + curr.tags.length, 0);
  const recall = correctMatches / totalExpectedTags;
  const f1Score = (2 * (precision * recall)) / (precision + recall) || 0; // Avoid division by zero

  return { precision, recall, f1Score };
}

// Simple similarity measure for titles (could be replaced with a more sophisticated algorithm)
export function calculateTitleSimilarity(
  aiTitle: string,
  expectedTitle: string
): number {
  const aiWords = aiTitle.toLowerCase().split(/\s+/);
  const expectedWords = expectedTitle.toLowerCase().split(/\s+/);
  const matchingWords = expectedWords.filter((word) => aiWords.includes(word));
  const similarity = matchingWords.length / expectedWords.length;
  return similarity; // Returns a value between 0 and 1
}

function calculateTitleMetrics(
  aiResponse: Task[],
  expectedResponse: Task[]
): Metrics {
  let totalSimilarity = 0;
  let totalPossible = expectedResponse.length; // Assuming every expectedResponse has a title

  aiResponse.forEach((aiTask, index) => {
    const expectedTask = expectedResponse[index];
    // Calculate similarity for each title pair
    const similarity = calculateTitleSimilarity(
      aiTask.title,
      expectedTask?.title || ""
    );
    totalSimilarity += similarity; // Sum up all similarities
  });

  // Precision and recall are conceptually tricky in this context. Assuming each title has a chance to be correct (1 point)
  // and our similarity score approximates "correctness," we can use the total similarity as a proxy for correct identifications.
  const precision = totalSimilarity / aiResponse.length; // How precise the AI titles are on average
  const recall = totalSimilarity / totalPossible; // How many of the expected titles were "covered" by the AI
  const f1Score = (2 * (precision * recall)) / (precision + recall) || 0; // Harmonic mean, or 0 if either is 0

  return { precision, recall, f1Score };
}

function calculateTimeMetrics(
  aiResponse: Task[],
  expectedResponse: Task[]
): Metrics {
  let correctMatches = 0; // Count of exactly matched times

  aiResponse.forEach((aiTask, index) => {
    const expectedTask = expectedResponse[index];
    // Check both fromTime and toTime for an exact match
    const fromTimeMatch = aiTask.fromTime === expectedTask?.fromTime ? 1 : 0;
    const toTimeMatch = aiTask.toTime === expectedTask?.toTime ? 1 : 0;
    correctMatches += fromTimeMatch + toTimeMatch; // Each correct time counts as a match
  });

  // Since we're counting both fromTime and toTime, adjust total identifications and total possible matches accordingly
  const totalIdentifications = aiResponse.length * 2; // Each task has two time fields
  const totalPossibleMatches = expectedResponse.length * 2; // Each expected task has two correct time fields

  // Calculate precision and recall
  const precision = correctMatches / totalIdentifications;
  const recall = correctMatches / totalPossibleMatches;
  const f1Score = (2 * (precision * recall)) / (precision + recall) || 0; // Harmonic mean, or 0 if either is 0

  return { precision, recall, f1Score };
}

export function calculateMetrics(
  aiResponse: Task[],
  expectedResponse: Task[],
  attributes: ("date" | "tags" | "title" | "time" | "subtasks")[]
): Record<string, Metrics> {
  const metrics: Record<string, Metrics> = {};

  attributes.forEach((attribute) => {
    switch (attribute) {
      case "date":
        metrics.date = calculateDateMetrics(aiResponse, expectedResponse);
        break;
      case "tags":
        metrics.tags = calculateTagsMetrics(aiResponse, expectedResponse);
        break;
      case "title":
        metrics.title = calculateTitleMetrics(aiResponse, expectedResponse);
        break;
      case "time":
        metrics.time = calculateTimeMetrics(aiResponse, expectedResponse);
        break;
      default:
        throw new Error(`Unknown attribute: ${attribute}`);
    }
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
