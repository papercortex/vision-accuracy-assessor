import { MetricAttribute, Metrics, OverallMetrics } from "./metric.interface";
import { Task } from "./task.interface";

export interface Analysis {
  fullSamplePath: string;
  metrics: Record<MetricAttribute, Metrics>;
  overallMetrics: OverallMetrics;
  prompt: string;
  aiTasks: Task[];
  expectedTasks: Task[];
}
