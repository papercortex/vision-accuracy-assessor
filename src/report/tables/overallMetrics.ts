import Table from "cli-table";
import { Analysis } from "../../models/analysis.interface";
import chalk, { ChalkInstance } from "chalk";

// Utility function to calculate the arithmetic mean
function calculateArithmeticMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  return sum / values.length;
}

// Function to calculate color based on metric value
function colorForMetric(value: number): ChalkInstance {
  if (value >= 0.8) return chalk.green;
  else if (value >= 0.5) return chalk.yellow;
  else return chalk.red;
}

export function generateOverallMetricsTable(
  allRuns: Record<string, Analysis>
): Table {
  const table = new Table({
    head: [
      "Overall Metric",
      "Average Precision",
      "Average Recall",
      "Average F1 Score",
    ],
  });

  // Collecting overall metrics for each run
  let overallPrecisions: number[] = [];
  let overallRecalls: number[] = [];
  let overallF1Scores: number[] = [];

  Object.values(allRuns).forEach((run: Analysis) => {
    overallPrecisions.push(run.overallMetrics.precision);
    overallRecalls.push(run.overallMetrics.recall);
    overallF1Scores.push(run.overallMetrics.f1Score);
  });

  // Calculate averages using the utility function
  const avgPrecision = calculateArithmeticMean(overallPrecisions);
  const avgRecall = calculateArithmeticMean(overallRecalls);
  const avgF1Score = calculateArithmeticMean(overallF1Scores);

  // Populate the table with the overall metrics
  table.push([
    "Overall Average",
    colorForMetric(avgPrecision)(avgPrecision.toFixed(2)),
    colorForMetric(avgRecall)(avgRecall.toFixed(2)),
    colorForMetric(avgF1Score)(avgF1Score.toFixed(2)),
  ]);

  return table;
}
