import { loadEnvironmentFiles } from "./environment.js";

loadEnvironmentFiles();

await import("./main.js");
