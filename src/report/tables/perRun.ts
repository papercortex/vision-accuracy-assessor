import Table from "cli-table";
import chalk from "chalk";
import { Analysis } from "../../models/analysis.interface";

function colorForMetric(value: number) {
  if (value >= 0.8) return "green";
  else if (value >= 0.5) return "yellow";
  else return "red";
}

export function generatePerRunTable(run: Analysis) {
  // Initialize CLI Table
  const table = new Table({
    head: ["Attribute", "Precision", "Recall", "F1 Score"],
  });

  // Populate the table
  Object.entries(run.metrics).forEach(([attribute, metrics]) => {
    table.push([
      attribute,
      chalk[colorForMetric(metrics.precision)](metrics.precision.toFixed(2)),
      chalk[colorForMetric(metrics.recall)](metrics.recall.toFixed(2)),
      chalk[colorForMetric(metrics.f1Score)](metrics.f1Score.toFixed(2)),
    ]);
  });

  // Overall Metrics
  table.push([
    "Overall",
    chalk[colorForMetric(run.overallMetrics.precision)](
      run.overallMetrics.precision.toFixed(2)
    ),
    chalk[colorForMetric(run.overallMetrics.recall)](
      run.overallMetrics.recall.toFixed(2)
    ),
    chalk[colorForMetric(run.overallMetrics.f1Score)](
      run.overallMetrics.f1Score.toFixed(2)
    ),
  ]);

  return table;
}
