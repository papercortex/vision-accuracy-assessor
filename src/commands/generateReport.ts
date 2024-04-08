import { loadAllRunAnalysisObjects } from "../utils/runAnalysisFileHandler";
import { RunAnalysis, SampleAnalysis } from "../models/analysis.interface";
import chalk from "chalk";
import { listAllSamplesInGroup } from "../utils/fileHandler";
import {
  generateAggregateForMultipleSamplesTable,
  generateAggregateMetricsTable,
  generatePerRunTable,
} from "../report/cli/tables";

interface Arguments {
  samplesGroup: string;
  samples: string[];
}

async function generateReportForSample(sampleAnalysis: SampleAnalysis) {
  console.log("\n\n");
  console.log("=====================================");
  console.log(
    "> Generating Report for Sample: ",
    `${sampleAnalysis.sampleGroup}/${sampleAnalysis.sample}`
  );
  console.log("> Total Runs: ", Object.keys(sampleAnalysis.runs).length);
  console.log("=====================================");

  for (const timestamp in sampleAnalysis.runs) {
    const run = sampleAnalysis.runs[timestamp] as RunAnalysis;
    const perRunTable = generatePerRunTable(run);
    const readableTimestamp = new Date(parseInt(timestamp)).toLocaleString();
    console.log(chalk.blue("\n-> Run at: ", readableTimestamp));
    console.log(perRunTable.toString());
  }

  const aggregateTable = generateAggregateMetricsTable(sampleAnalysis);
  console.log(chalk.blue("\n-> Aggregated Attributes:"));
  console.log(aggregateTable.toString());
}

export async function generateReport(args: Arguments) {
  const samplesAnalysis: SampleAnalysis[] = [];
  let samples: string[];
  if (args.samples[0] === "all") {
    samples = await listAllSamplesInGroup(args.samplesGroup);
  } else {
    samples = args.samples;
  }

  for (const sample of samples) {
    const allRuns = await loadAllRunAnalysisObjects(args.samplesGroup, sample);
    const sampleAnalysis: SampleAnalysis = {
      sample,
      sampleGroup: args.samplesGroup,
      runs: allRuns,
    };
    samplesAnalysis.push(sampleAnalysis);
  }

  const samplesSummary = generateAggregateForMultipleSamplesTable(
    samplesAnalysis,
    "f1Score"
  );

  console.log(chalk.blue("\n-> F1 Score Summary:"));
  console.log(samplesSummary.toString());
}
