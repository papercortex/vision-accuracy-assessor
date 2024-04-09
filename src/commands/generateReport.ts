import { SampleAnalysis, TestSample } from "../models/analysis.interface";
import chalk from "chalk";
import {
  getMultipleSamplesTablePerMetric,
  getRunAttributeMetricsTable,
} from "../report/cli/getRunAttributeMetricsTable";
import { Task } from "../models/task.interface";
import { listAllSamplesInGroup, loadSample } from "../services/samples";
import { analyze } from "../services/analysis";

interface Arguments {
  samplesGroup: string;
  samples: string[];
}

async function generateReportForSample(sampleAnalysis: SampleAnalysis<Task[]>) {
  console.log("=====================================");
  console.log(
    "> Sample Analysis:",
    `${sampleAnalysis.sampleGroup}/${sampleAnalysis.sample}`
  );
  console.log("-------------------------------------");
  console.log("- Total Runs: ", Object.keys(sampleAnalysis.runs).length);

  for (const timestamp in sampleAnalysis.runs) {
    const run = sampleAnalysis.runs[timestamp];
    if (!run) {
      throw new Error(`Run not found for timestamp: ${timestamp}`);
    }
    const perRunTable = getRunAttributeMetricsTable(run);
    const readableTimestamp = new Date(parseInt(timestamp)).toLocaleString();
    console.log(chalk.blue("\n-> Run at: ", readableTimestamp));
    console.log(perRunTable.toString());
  }
  console.log("=====================================");
  console.log("\n\n");
}

export async function generateReport(args: Arguments) {
  const samplesAnalysis: SampleAnalysis<Task[]>[] = [];
  let samples: TestSample<Task[]>[];
  if (args.samples[0] === "all") {
    samples = await listAllSamplesInGroup<Task[]>(args.samplesGroup);
  } else {
    samples = await Promise.all(
      args.samples.map((sample) =>
        loadSample<Task[]>(sample, args.samplesGroup)
      )
    );
  }

  for (const sample of samples) {
    samplesAnalysis.push(await analyze(sample));
  }

  samplesAnalysis.forEach(generateReportForSample);

  console.log("=====================================");
  console.log("> Summary of Samples:");
  console.log("-------------------------------------");
  ["precision", "recall", "f1Score"].forEach((metric) => {
    const metricSamplesSummary = getMultipleSamplesTablePerMetric(
      samplesAnalysis,
      metric as "precision" | "recall" | "f1Score"
    );
    console.log(chalk.blue("\n->", metric, "Summary:"));
    console.log(metricSamplesSummary.toString());
  });
  console.log("=====================================");
}
