import { distance } from "fastest-levenshtein";
import { Task } from "../../models/task.interface";
import { Metrics } from "../../models/metric.interface";
import { calculateAdjustedMetrics } from "../utils";

export function calculateTitleMetricForTaskPair(
  aiTask: Task,
  expectedTask: Task
): Metrics {
  // Convert titles to lower case for case-insensitive comparison
  const aiTitle = aiTask.title.toLowerCase();
  const expectedTitle = expectedTask.title.toLowerCase();

  // Calculate the Levenshtein distance
  const editDistance = distance(aiTitle, expectedTitle);

  // Determine the match threshold based on the length of the expected title
  const matchThreshold = expectedTitle.length / 2; // 50% of the expected title length

  // Determine True Positives (TP), False Positives (FP), and False Negatives (FN)
  const TP = editDistance <= matchThreshold ? 1 : 0;
  const FP = editDistance > matchThreshold ? 1 : 0;
  const FN = aiTitle === "" ? 1 : 0; // Assuming FN occurs only if the AI fails to generate a title

  return calculateAdjustedMetrics(TP, FP, FN);
}
