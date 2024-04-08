import { PerformanceMetrics } from "../../models/metric.interface";
import { Task } from "../../models/task.interface";
import { calculateAdjustedMetrics } from "../calculateAdjustedMetrics";

export function calculateTimeMetricForTaskPair(
  aiTask: Task,
  expectedTask: Task,
  timeAttribute: "fromTime" | "toTime" // Specify which time attribute to compare
): PerformanceMetrics {
  // Check for missing or invalid expected time attribute
  if (!expectedTask[timeAttribute]) {
    throw new Error(`Expected task has no '${timeAttribute}'.`);
  }

  const isValidAITime = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
    aiTask[timeAttribute] || ""
  );

  // Handling AI time attribute missing or invalid format
  if (!aiTask[timeAttribute] || !isValidAITime) {
    if (!isValidAITime) {
      // AI time attribute in an invalid format should very negatively impact the score
      // Considering this scenario as both a false positive and false negative to severely impact precision and recall
      return { precision: 0, recall: 0, f1Score: 0 };
    }
    // If time attribute is just missing, count as a False Negative
    return { precision: 0, recall: 0, f1Score: 0 };
  }

  // True Positive (TP): AI time attribute matches expected time attribute
  const TP = aiTask[timeAttribute] === expectedTask[timeAttribute] ? 1 : 0;
  // False Positive (FP) and False Negative (FN) not separately defined for binary outcome
  // FP is implicitly 0 if there's a match, or 1 if there's no match but time attribute is present
  // FN is 0 in this context since time attribute is present in AI task
  const FP = TP === 1 ? 0 : 1;
  const FN = 0; // Defined by your criteria

  return calculateAdjustedMetrics(TP, FP, FN);
}

export function calculateFromTimeMetricForTaskPair(
  aiTask: Task,
  expectedTask: Task
): PerformanceMetrics {
  return calculateTimeMetricForTaskPair(aiTask, expectedTask, "fromTime");
}

export function calculateToTimeMetricForTaskPair(
  aiTask: Task,
  expectedTask: Task
): PerformanceMetrics {
  return calculateTimeMetricForTaskPair(aiTask, expectedTask, "toTime");
}
