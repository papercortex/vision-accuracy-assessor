import fs from "fs/promises";
import path from "path";

export async function storeDebugObject(file: string, object: any) {
  const fileWithoutExtension = file.replace(/\.[^/.]+$/, "");
  const debugDir = path.join(process.cwd(), `debug`);
  try {
    await fs.mkdir(debugDir, { recursive: true });
  } catch (error) {}
  await fs.writeFile(
    path.join(debugDir, `${fileWithoutExtension}.json`),
    JSON.stringify(object, null, 2)
  );
}

export async function loadDebugObject(file: string) {
  const fileWithoutExtension = file.replace(/\.[^/.]+$/, "");
  const debugDir = path.join(process.cwd(), `debug`);
  try {
    const data = await fs.readFile(
      path.join(debugDir, `${fileWithoutExtension}.json`),
      { encoding: "utf8" }
    );
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading debug object for ${file}:`, error);
    throw error;
  }
}
