import { MetricAttribute, Metrics, OverallMetrics } from "./metric.interface";
import { Task } from "./task.interface";

export interface RunAnalysis {
  fullSamplePath: string;
  metrics: Record<MetricAttribute, Metrics>;
  overallMetrics: OverallMetrics;
  prompt: string;
  aiTasks: Task[];
  expectedTasks: Task[];
}

export interface SampleAnalysis {
  sample: string;
  sampleGroup: string;
  runs: Record<string, RunAnalysis>;
}
