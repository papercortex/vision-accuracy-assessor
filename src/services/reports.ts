import fs from "fs/promises";
import path from "path";

function removeAnsiColors(str: string) {
  return str.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
}

export async function storeReport(reportLogs: string) {
  const reportDir = path.join(process.cwd(), `reports`);
  try {
    await fs.mkdir(reportDir, {
      recursive: true,
    });
  } catch (error) {
    console.error("Error creating directory:", error);
  }
  const ts = new Date().getTime();
  await fs.writeFile(
    path.join(reportDir, `${ts}.txt`),
    removeAnsiColors(reportLogs)
  );
}
