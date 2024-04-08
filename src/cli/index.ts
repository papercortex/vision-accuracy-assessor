import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { processSamples } from "../commands/processSamples";
import { generateReport } from "../commands/generateReport";

// Parse the command line arguments
yargs(hideBin(process.argv))
  .command(
    "run",
    "Feed the AI with samples and store the results",
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
        .option("runs", {
          describe: "Number of runs to process each sample",
          type: "number",
          default: 1,
        });
    },
    processSamples
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
