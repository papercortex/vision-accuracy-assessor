import { PerformanceMetrics } from "../../models/metric.interface";
import { Task } from "../../models/task.interface";
import { calculateAdjustedMetrics } from "../calculateAdjustedMetrics";
import { parse, differenceInMinutes } from "date-fns";

export function calculateTimeMetricForTaskPair(
  aiTask: Task,
  expectedTask: Task,
  timeAttribute: "fromTime" | "toTime"
): PerformanceMetrics {
  // Check for missing or invalid expected time attribute
  if (!expectedTask[timeAttribute]) {
    throw new Error(`Expected task has no '${timeAttribute}'.`);
  }

  // Convert time strings to Date objects. Assuming the date doesn't matter, just the time
  // So, we use a fixed date for both times
  const aiTime = parse(aiTask[timeAttribute] || "", "HH:mm", new Date(0));
  const expectedTime = parse(expectedTask[timeAttribute], "HH:mm", new Date(0));

  // Check if aiTime is invalid (Invalid Date)
  if (isNaN(aiTime.getTime())) {
    // If the time attribute is invalid, it should very negatively impact the score
    return { precision: 0, recall: 0, f1Score: 0 };
  }

  // Calculate the difference in minutes between aiTime and expectedTime
  const timeDifference = differenceInMinutes(aiTime, expectedTime);

  // Determine if the AI time is within a 5-minute range of the expected time
  const isWithinRange = timeDifference >= -5 && timeDifference <= 5;

  // True Positive (TP): AI time attribute is within the valid range of expected time attribute
  const TP = isWithinRange ? 1 : 0;
  // False Positive (FP) is 0 if there's a match, or 1 if there's no match but time attribute is valid
  const FP = TP === 1 ? 0 : 1;
  const FN = 0; // Defined by the requirement

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
