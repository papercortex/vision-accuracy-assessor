import { MetricAttribute } from "../models/metric.interface";

export const taskAttributeWeights: Record<MetricAttribute, number> = {
  date: 3, // Highest weight
  fromTime: 3, // Highest weight
  toTime: 3, // Highest weight
  tags: 2, // High weight
  title: 1, // Default weight
};

export const taskLevelWeight = 3; // Highest weight
