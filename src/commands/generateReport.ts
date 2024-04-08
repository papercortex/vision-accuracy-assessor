import { SampleAnalysis, TestSample } from "../models/analysis.interface";
import chalk from "chalk";
import { generateAggregateForMultipleSamplesTable } from "../report/cli/tables";
import { Task } from "../models/task.interface";
import { listAllSamplesInGroup, loadSample } from "../services/samples";
import { analyze } from "../services/analysis";

interface Arguments {
  samplesGroup: string;
  samples: string[];
}

// async function generateReportForSample(sampleAnalysis: SampleAnalysis) {
//   console.log("\n\n");
//   console.log("=====================================");
//   console.log(
//     "> Generating Report for Sample: ",
//     `${sampleAnalysis.sampleGroup}/${sampleAnalysis.sample}`
//   );
//   console.log("> Total Runs: ", Object.keys(sampleAnalysis.runs).length);
//   console.log("=====================================");

//   for (const timestamp in sampleAnalysis.runs) {
//     const run = sampleAnalysis.runs[timestamp] as SampleRunAnalysis;
//     const perRunTable = generatePerRunTable(run);
//     const readableTimestamp = new Date(parseInt(timestamp)).toLocaleString();
//     console.log(chalk.blue("\n-> Run at: ", readableTimestamp));
//     console.log(perRunTable.toString());
//   }

//   const aggregateTable = generateAggregateMetricsTable(sampleAnalysis);
//   console.log(chalk.blue("\n-> Aggregated Attributes:"));
//   console.log(aggregateTable.toString());
// }

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

  const samplesSummary = generateAggregateForMultipleSamplesTable(
    samplesAnalysis,
    "f1Score"
  );

  console.log(chalk.blue("\n-> F1 Score Summary:"));
  console.log(samplesSummary.toString());
}
