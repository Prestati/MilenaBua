import "server-only";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const dir = path.join(process.cwd(), "src/content");

export function readContent<T>(file: string): T {
  const raw = readFileSync(path.join(dir, file), "utf-8");
  return JSON.parse(raw) as T;
}

export function writeContent(file: string, data: unknown): void {
  writeFileSync(path.join(dir, file), JSON.stringify(data, null, 2));
}
