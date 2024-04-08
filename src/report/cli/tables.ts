import Table from "cli-table";
import { RunAnalysis, SampleAnalysis } from "../../models/analysis.interface";
import {
  calculateAggregatedAttributesForMultipleRuns,
  calculateOverallMetricsForMultipleRuns,
} from "../../metrics/calculate";
import { renderMetricValue } from "./utils";

export function generateAggregateMetricsTable(sample: SampleAnalysis) {
  const aggregatedAttributes = calculateAggregatedAttributesForMultipleRuns(
    sample.runs
  );

  const table = new Table({
    head: [
      "Attribute",
      "Average Precision",
      "Average Recall",
      "Average F1 Score",
    ],
  });

  Object.entries(aggregatedAttributes).forEach(([attribute, metrics]) => {
    const averagePrecision = metrics.precision;
    const averageRecall = metrics.recall;
    const averageF1Score = metrics.f1Score;

    table.push([
      attribute,
      renderMetricValue(averagePrecision),
      renderMetricValue(averageRecall),
      renderMetricValue(averageF1Score),
    ]);
  });

  return table;
}

export function generateAggregateForMultipleSamplesTable(
  samples: SampleAnalysis[],
  metricAttribute: "precision" | "recall" | "f1Score"
) {
  const table = new Table({
    head: [
      "Sample",
      "#Runs",
      "title",
      "tags",
      "date",
      "fromTime",
      "toTime",
      "Weighted Avg.",
    ],
  });

  samples.forEach((sample) => {
    const aggregatedAttributes = calculateAggregatedAttributesForMultipleRuns(
      sample.runs
    );

    const overallMetrics = calculateOverallMetricsForMultipleRuns(sample.runs);

    const sampleRow = [
      sample.sample,
      Object.keys(sample.runs).length.toString(),
      renderMetricValue(aggregatedAttributes.title[metricAttribute]),
      renderMetricValue(aggregatedAttributes.tags[metricAttribute]),
      renderMetricValue(aggregatedAttributes.date[metricAttribute]),
      renderMetricValue(aggregatedAttributes.fromTime[metricAttribute]),
      renderMetricValue(aggregatedAttributes.toTime[metricAttribute]),
      renderMetricValue(overallMetrics[metricAttribute]),
    ];

    table.push(sampleRow);
  });

  return table;
}

export function generateOverallMetricsTable(samples: SampleAnalysis[]) {
  const table = new Table({
    head: ["Sample", "Precision", "Recall", "F1 Score"],
  });

  samples.forEach((sample) => {
    const overallMetrics = calculateOverallMetricsForMultipleRuns(sample.runs);

    table.push([
      sample.sample,
      renderMetricValue(overallMetrics.precision),
      renderMetricValue(overallMetrics.recall),
      renderMetricValue(overallMetrics.f1Score),
    ]);
  });

  return table;
}

export function generatePerRunTable(run: RunAnalysis) {
  // Initialize CLI Table
  const table = new Table({
    head: ["Attribute", "Precision", "Recall", "F1 Score"],
  });

  // Populate the table
  Object.entries(run.metrics).forEach(([attribute, metrics]) => {
    table.push([
      attribute,
      renderMetricValue(metrics.precision),
      renderMetricValue(metrics.recall),
      renderMetricValue(metrics.f1Score),
    ]);
  });

  // Overall Metrics
  table.push([
    "Overall",
    renderMetricValue(run.overallMetrics.precision),
    renderMetricValue(run.overallMetrics.recall),
    renderMetricValue(run.overallMetrics.f1Score),
  ]);

  return table;
}
