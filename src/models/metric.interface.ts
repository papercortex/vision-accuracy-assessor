export type MetricAttribute = "date" | "tags" | "title" | "fromTime" | "toTime";

export interface PerformanceMetrics {
  precision: number; // Correctness of what is predicted
  recall: number; // Completeness of the prediction
  f1Score: number;
}
