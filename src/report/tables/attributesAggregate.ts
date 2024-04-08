// Assuming these imports and functions are defined as previously discussed
import Table from "cli-table";
import chalk, { ChalkInstance } from "chalk";
import { Analysis } from "../../models/analysis.interface";
import { MetricAttribute, Metrics } from "../../models/metric.interface";

// Function to calculate color based on metric value
function colorForMetric(value: number): ChalkInstance {
  if (value >= 0.8) return chalk.green;
  else if (value >= 0.5) return chalk.yellow;
  else return chalk.red;
}

// Function to initialize metrics sums with zeros
function initializeMetricsSums(): Record<MetricAttribute, Metrics> {
  return {
    date: { precision: 0, recall: 0, f1Score: 0 },
    tags: { precision: 0, recall: 0, f1Score: 0 },
    title: { precision: 0, recall: 0, f1Score: 0 },
    fromTime: { precision: 0, recall: 0, f1Score: 0 },
    toTime: { precision: 0, recall: 0, f1Score: 0 },
  };
}

export function generateAggregateMetricsTable(
  allRuns: Record<string, Analysis>
) {
  const table = new Table({
    head: [
      "Attribute",
      "Average Precision",
      "Average Recall",
      "Average F1 Score",
    ],
    colWidths: [20, 20, 20, 20],
  });

  let metricsSums = initializeMetricsSums();
  let numberOfRuns = Object.keys(allRuns).length; // Tracking the number of runs for average calculation

  // Sum metrics for each run
  Object.values(allRuns).forEach((run: Analysis) => {
    Object.entries(run.metrics).forEach(
      ([attribute, { precision, recall, f1Score }]) => {
        const attr: MetricAttribute = attribute as MetricAttribute;
        metricsSums[attr].precision += precision;
        metricsSums[attr].recall += recall;
        metricsSums[attr].f1Score += f1Score;
      }
    );
  });

  // Calculate averages and populate the table
  Object.entries(metricsSums).forEach(([attribute, metrics]) => {
    const averagePrecision = metrics.precision / numberOfRuns;
    const averageRecall = metrics.recall / numberOfRuns;
    const averageF1Score = metrics.f1Score / numberOfRuns;

    table.push([
      attribute,
      colorForMetric(averagePrecision)(averagePrecision.toFixed(2)),
      colorForMetric(averageRecall)(averageRecall.toFixed(2)),
      colorForMetric(averageF1Score)(averageF1Score.toFixed(2)),
    ]);
  });

  return table;
}
