import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function loadEnvironmentFiles() {
  const apiDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const candidates = [
    resolve(apiDirectory, "../../.env.local"),
    resolve(apiDirectory, "../../.env"),
    resolve(apiDirectory, "../../packages/database/.env.local"),
    resolve(apiDirectory, "../../packages/database/.env"),
    resolve(apiDirectory, ".env.local"),
    resolve(apiDirectory, ".env"),
  ];

  for (const path of candidates) {
    if (existsSync(path)) loadEnvFile(path);
  }
}
