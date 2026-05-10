import { loadEnv } from "../loaders/env-loader.js";
import { inferSchemaFromEnv, validateEnv } from "../validators/inference.js";
import { z } from "zod";
import { existsSync } from "fs";
import { join } from "path";

export class EnvDeckValidationError extends Error {
  constructor(public errors: z.ZodFormattedError<Record<string, unknown>>) {
    super("❌ Invalid environment variables");
    this.name = "EnvDeckValidationError";
  }
}

type EnvRecord = Record<string, unknown>;
let cachedEnv: EnvRecord | null = null;

export function getEnv(): EnvRecord {
  if (cachedEnv) return cachedEnv;

  const { full, local } = loadEnv();

  const configPath = [
    "envdeck.config.ts",
    "env.config.ts",
    "envdeck.config.js",
    "env.config.js",
  ]
    .map((p) => join(process.cwd(), p))
    .find((p) => existsSync(p));

  const schema = configPath
    ? inferSchemaFromEnv(local) // Schema Mode (V1 uses inference as fallback)
    : inferSchemaFromEnv(local); // Zero-Config: infer from local vars only

  const result = validateEnv(full, schema);

  if (!result.success) {
    if (process.env.NODE_ENV === "test") {
      throw new EnvDeckValidationError(result.errors);
    }
    console.error("❌ Invalid environment variables\n");
    console.error(JSON.stringify(result.errors, null, 2));
    throw new EnvDeckValidationError(result.errors);
  }

  cachedEnv = Object.freeze(result.data) as EnvRecord;
  return cachedEnv;
}

export const env = getEnv();

export function createEnv<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape);
}

export { z };
