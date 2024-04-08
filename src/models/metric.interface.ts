export type MetricAttribute = "date" | "tags" | "title" | "fromTime" | "toTime";

export interface OverallMetrics extends Metrics {
  totalAttributes: number;
  attributeWeights: Record<MetricAttribute, number>;
}

export interface Metrics {
  precision: number; // Correctness of what is predicted
  recall: number; // Completeness of the prediction
  f1Score: number;
}
