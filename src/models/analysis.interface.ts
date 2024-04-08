import { MetricAttribute, PerformanceMetrics } from "./metric.interface";

export interface SampleRunDetails<T> {
  sample: string;
  sampleGroup: string;
  prompt: string;
  aiJson: T;
}

export interface SampleRunAnalysis<T> {
  details: SampleRunDetails<T>;
  attributeMetrics: Record<MetricAttribute, PerformanceMetrics>;
  weightedAggregateMetrics: PerformanceMetrics;
}

export interface SampleAnalysis<T> {
  sample: string;
  sampleGroup: string;
  runs: Record<string, SampleRunAnalysis<T>>;
  averageAttributeMetrics: Record<MetricAttribute, PerformanceMetrics>;
  overallWeightedMetrics: PerformanceMetrics;
}

export interface TestSample<T> {
  sample: string;
  sampleGroup: string;
  sampleImageFullPath: string;
  expectedJson: T | null;
}
