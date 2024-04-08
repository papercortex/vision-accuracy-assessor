import Table from "cli-table";
import {
  SampleAnalysis,
  SampleRunAnalysis,
} from "../../models/analysis.interface";
import { renderMetricValue } from "./utils";

export function generateAggregateMetricsTable<T>(
  sampleAnalysis: SampleAnalysis<T>
) {
  const table = new Table({
    head: [
      "Attribute",
      "Average Precision",
      "Average Recall",
      "Average F1 Score",
    ],
  });

  Object.entries(sampleAnalysis.averageAttributeMetrics).forEach(
    ([attribute, metrics]) => {
      const averagePrecision = metrics.precision;
      const averageRecall = metrics.recall;
      const averageF1Score = metrics.f1Score;

      table.push([
        attribute,
        renderMetricValue(averagePrecision),
        renderMetricValue(averageRecall),
        renderMetricValue(averageF1Score),
      ]);
    }
  );

  return table;
}

export function generateAggregateForMultipleSamplesTable<T>(
  samples: SampleAnalysis<T>[],
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

  samples.forEach((sampleAnalysis) => {
    const sampleRow = [
      sampleAnalysis.sample,
      Object.keys(sampleAnalysis.runs).length.toString(),
      renderMetricValue(
        sampleAnalysis.averageAttributeMetrics.title[metricAttribute]
      ),
      renderMetricValue(
        sampleAnalysis.averageAttributeMetrics.tags[metricAttribute]
      ),
      renderMetricValue(
        sampleAnalysis.averageAttributeMetrics.date[metricAttribute]
      ),
      renderMetricValue(
        sampleAnalysis.averageAttributeMetrics.fromTime[metricAttribute]
      ),
      renderMetricValue(
        sampleAnalysis.averageAttributeMetrics.toTime[metricAttribute]
      ),
      renderMetricValue(sampleAnalysis.overallWeightedMetrics[metricAttribute]),
    ];

    table.push(sampleRow);
  });

  return table;
}

export function generateOverallMetricsTable<T>(samples: SampleAnalysis<T>[]) {
  const table = new Table({
    head: ["Sample", "Precision", "Recall", "F1 Score"],
  });

  samples.forEach((sample) => {
    table.push([
      sample.sample,
      renderMetricValue(sample.overallWeightedMetrics.precision),
      renderMetricValue(sample.overallWeightedMetrics.recall),
      renderMetricValue(sample.overallWeightedMetrics.f1Score),
    ]);
  });

  return table;
}

export function generatePerRunTable<T>(runAnalysis: SampleRunAnalysis<T>) {
  // Initialize CLI Table
  const table = new Table({
    head: ["Attribute", "Precision", "Recall", "F1 Score"],
  });

  // Populate the table
  Object.entries(runAnalysis.attributeMetrics).forEach(
    ([attribute, metrics]) => {
      table.push([
        attribute,
        renderMetricValue(metrics.precision),
        renderMetricValue(metrics.recall),
        renderMetricValue(metrics.f1Score),
      ]);
    }
  );

  // Overall Metrics
  table.push([
    "Overall",
    renderMetricValue(runAnalysis.weightedAggregateMetrics.precision),
    renderMetricValue(runAnalysis.weightedAggregateMetrics.recall),
    renderMetricValue(runAnalysis.weightedAggregateMetrics.f1Score),
  ]);

  return table;
}
