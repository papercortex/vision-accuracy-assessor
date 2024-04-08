import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { processSamples } from "../commands/processSamples";
import { recalculateMetrics } from "../commands/recalculateMetrics";
import { generateReport } from "../commands/generateReport";

// Parse the command line arguments
yargs(hideBin(process.argv))
  .command(
    "evaluate",
    "Evaluate the AI model on a set of samples",
    // @ts-ignore
    (yargs) => {
      return yargs
        .option("samples-group", {
          describe: "Samples group to search for in the directory",
          type: "string",
          demandOption: true,
        })
        .option("samples", {
          alias: "s",
          describe: "Comma-separated list of sample dates to process",
          type: "string",
          demandOption: true,
          array: true,
        })
        .option("skip-ai-analysis", {
          describe: "Skip AI analysis for the samples",
          type: "boolean",
          default: true,
        })
        .option("runs", {
          describe: "Number of runs to process each sample",
          type: "number",
          default: 1,
        });
    },
    processSamples
  )
  .command(
    "recalculate",
    "Recalculate the AI analysis for a set of samples",
    // @ts-ignore
    (yargs) => {
      return yargs
        .option("samples-group", {
          describe: "Samples group to search for in the directory",
          type: "string",
          demandOption: true,
        })
        .option("samples", {
          alias: "s",
          describe: "Comma-separated list of sample dates to process",
          type: "string",
          demandOption: true,
          array: true,
        });
    },
    recalculateMetrics
  )
  .command(
    "report",
    "Generate a report for a set of samples",
    // @ts-ignore
    (yargs) => {
      return yargs
        .option("samples-group", {
          describe: "Samples group to search for in the directory",
          type: "string",
          demandOption: true,
        })
        .option("samples", {
          alias: "s",
          describe: "Comma-separated list of sample dates to process",
          type: "string",
          demandOption: true,
          array: true,
        });
    },
    generateReport
  )
  .help("h")
  .alias("h", "help")
  .parse();
