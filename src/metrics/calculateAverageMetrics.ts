import { PerformanceMetrics } from "../models/metric.interface";

export function calculateAverageMetrics(
  metricsArray: PerformanceMetrics[]
): PerformanceMetrics {
  let totalPrecision = 0;
  let totalRecall = 0;
  let totalF1Score = 0;
  let count = metricsArray.length; // Total number of metrics provided

  metricsArray.forEach((metrics) => {
    totalPrecision += metrics.precision;
    totalRecall += metrics.recall;
    totalF1Score += metrics.f1Score;
  });

  // Calculate averages for each metric
  const averagePrecision = totalPrecision / count;
  const averageRecall = totalRecall / count;
  const averageF1Score = totalF1Score / count;

  return {
    precision: isNaN(averagePrecision) ? 0 : averagePrecision,
    recall: isNaN(averageRecall) ? 0 : averageRecall,
    f1Score: isNaN(averageF1Score) ? 0 : averageF1Score,
  };
}
