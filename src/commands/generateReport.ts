import { SampleAnalysis, TestSample } from "../models/analysis.interface";
import chalk from "chalk";
import {
  getMultipleSamplesTablePerMetric,
  getRunAttributeMetricsTable,
} from "../report/cli/getRunAttributeMetricsTable";
import { Task } from "../models/task.interface";
import { listAllSamplesInGroup, loadSample } from "../services/samples";
import { analyze } from "../services/analysis";
import { storeReport } from "../services/reports";

interface Arguments {
  samplesGroup: string;
  samples: string[];
}

const reportLogs: string[] = [];

async function generateReportForSample(sampleAnalysis: SampleAnalysis<Task[]>) {
  reportLogs.push("=====================================");
  reportLogs.push(
    `> Sample Analysis: ${sampleAnalysis.sampleGroup}/${sampleAnalysis.sample}`
  );
  reportLogs.push("-------------------------------------");
  reportLogs.push(`- Total Runs: ${Object.keys(sampleAnalysis.runs).length}`);

  for (const timestamp in sampleAnalysis.runs) {
    const run = sampleAnalysis.runs[timestamp];
    if (!run) {
      throw new Error(`Run not found for timestamp: ${timestamp}`);
    }
    const perRunTable = getRunAttributeMetricsTable(run);
    reportLogs.push(chalk.blue("\n-> Run timestamp: ", timestamp));
    reportLogs.push(perRunTable.toString());
  }
  reportLogs.push("=====================================");
  reportLogs.push("\n\n");
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

  reportLogs.push("=====================================");
  reportLogs.push("> Summary of Samples:");
  reportLogs.push("-------------------------------------");
  ["precision", "recall", "f1Score"].forEach((metric) => {
    const metricSamplesSummary = getMultipleSamplesTablePerMetric(
      samplesAnalysis,
      metric as "precision" | "recall" | "f1Score"
    );
    reportLogs.push(chalk.blue("\n->", metric, "Summary:"));
    reportLogs.push(metricSamplesSummary.toString());
  });
  reportLogs.push("=====================================");

  console.log(reportLogs.join("\n"));
  await storeReport(reportLogs.join("\n"));
}
