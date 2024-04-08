import { distance } from "fastest-levenshtein";
import { Task } from "../models/task.interface";

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

export function matchTasksByTitleSimilarity(
  aiResponse: Task[],
  expectedResponse: Task[],
  similarityThreshold = 0.1
): {
  matchedPairs: [Task, Task][];
  unmatchedAiTasks: Task[];
  unmatchedExpectedTasks: Task[];
} {
  const matchedPairs: [Task, Task][] = [];
  // Arrays to hold unmatched tasks
  const unmatchedAiTasks: Task[] = [...aiResponse];
  const unmatchedExpectedTasks: Task[] = [];

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

    if (bestMatch && highestSimilarity > similarityThreshold) {
      matchedPairs.push([bestMatch, expectedTask]);
      // Remove matched tasks from unmatchedAiTasks
      unmatchedAiTasks.splice(unmatchedAiTasks.indexOf(bestMatch), 1);
    } else {
      unmatchedExpectedTasks.push(expectedTask);
    }
  });

  return {
    matchedPairs,
    unmatchedAiTasks,
    unmatchedExpectedTasks,
  };
}
