import { PerformanceMetrics } from "../../models/metric.interface";
import { Task } from "../../models/task.interface";
import { calculateAdjustedMetrics } from "../calculateAdjustedMetrics";

export function calculateTagsMetricForTaskPair(
  aiTask: Task,
  expectedTask: Task
): PerformanceMetrics {
  // Ensure there are tags arrays to compare, even if they're empty, and normalize them
  // Make tags lowercase and remove duplicates
  const aiTags = [
    ...new Set((aiTask.tags || []).map((tag) => tag.toLowerCase())),
  ];
  const expectedTags = [
    ...new Set((expectedTask.tags || []).map((tag) => tag.toLowerCase())),
  ];

  // Calculate True Positives (TP), False Positives (FP), and False Negatives (FN)
  const TP = aiTags.filter((tag) => expectedTags.includes(tag)).length;
  const FP = aiTags.filter((tag) => !expectedTags.includes(tag)).length;
  const FN = expectedTags.filter((tag) => !aiTags.includes(tag)).length;

  const noDataValue = aiTags.length === 0 && expectedTags.length === 0 ? 1 : 0;

  return calculateAdjustedMetrics(TP, FP, FN, noDataValue);
}
