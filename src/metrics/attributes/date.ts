import { PerformanceMetrics } from "../../models/metric.interface";
import { Task } from "../../models/task.interface";
import { calculateAdjustedMetrics } from "../calculateAdjustedMetrics";

export function calculateDateMetricForTaskPair(
  aiTask: Task,
  expectedTask: Task
): PerformanceMetrics {
  if (!expectedTask.date) {
    throw new Error("Expected task has no date.");
  }

  const hasAIDate = !!aiTask.date;
  const isMatch = aiTask.date === expectedTask.date;

  // True Positive (TP): AI date matches expected date
  // False Positive (FP): AI has a date but doesn't match expected (in this binary context, same as FN, so not separately counted)
  // False Negative (FN): AI task has no date but expected does
  const TP = isMatch ? 1 : 0;
  const FP = hasAIDate && !isMatch ? 1 : 0;
  const FN = !hasAIDate ? 1 : 0;

  return calculateAdjustedMetrics(TP, FP, FN);
}
