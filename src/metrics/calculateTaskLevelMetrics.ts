import { Task } from "../models/task.interface";
import { PerformanceMetrics } from "../models/metric.interface";
import { calculateAdjustedMetrics } from "./calculateAdjustedMetrics";
import { matchTasksByTitleSimilarity } from "./utils";

export function calculateTaskLevelMetrics(
  aiResponse: Task[],
  expectedResponse: Task[]
): PerformanceMetrics {
  // Match tasks based on title similarity to pair them for comparison
  const { matchedPairs, unmatchedAiTasks, unmatchedExpectedTasks } =
    matchTasksByTitleSimilarity(aiResponse, expectedResponse);

  // The number of matched pairs is the number of True Positives (TP)
  const TP = matchedPairs.length;

  // The number of AI tasks that couldn't be matched to an expected task is the number of False Positives (FP)
  const FP = unmatchedAiTasks.length;

  // The number of expected tasks that couldn't be matched to an AI task is the number of False Negatives (FN)
  const FN = unmatchedExpectedTasks.length;

  // Use calculateAdjustedMetrics to calculate precision, recall, and f1 scores
  return calculateAdjustedMetrics(TP, FP, FN);
}
