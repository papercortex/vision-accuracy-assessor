import { loadAllRunAnalysisObjects } from "../utils/runAnalysisFileHandler";
import { Analysis } from "../models/analysis.interface";
import { generatePerRunTable } from "../report/tables/perRun";
import { generateAggregateMetricsTable } from "../report/tables/attributesAggregate";
import { generateOverallMetricsTable } from "../report/tables/overallMetrics";
import chalk from "chalk";

interface Arguments {
  samplesGroup: string;
  samples: string[];
}

async function generateReportForSample(sampleGroup: string, sample: string) {
  const allRuns = await loadAllRunAnalysisObjects(sampleGroup, sample);

  console.log("\n\n");
  console.log("=====================================");
  console.log("> Generating Report for Sample: ", `${sampleGroup}/${sample}`);
  console.log("> Total Runs: ", Object.keys(allRuns).length);
  console.log("=====================================");

  for (const timestamp in allRuns) {
    const run = allRuns[timestamp] as Analysis;
    const perRunTable = generatePerRunTable(run);
  }

  const aggregateTable = generateAggregateMetricsTable(allRuns);
  console.log(chalk.blue("\n-> Aggregated Attributes:"));
  console.log(aggregateTable.toString());

  const overallMetricsTable = generateOverallMetricsTable(allRuns);
  console.log(chalk.blue("\n-> Overall Metrics:"));
  console.log(overallMetricsTable.toString());
  console.log("=====================================");
  console.log("\n\n");
}

export async function generateReport(args: Arguments) {
  for (const sample of args.samples) {
    await generateReportForSample(args.samplesGroup, sample);
  }
}
