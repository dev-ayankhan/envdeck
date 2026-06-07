import { existsSync } from "fs";
import { join } from "path";
import jiti from "jiti";
import { inferSchemaFromEnv } from "../validators/inference.js";
import type { z } from "zod";

export function loadSchema(localEnv: Record<string, string>): z.ZodObject<Record<string, z.ZodType>> {
  const configPath = [
    "envdeck.config.ts",
    "env.config.ts",
    "envdeck.config.js",
    "env.config.js",
  ]
    .map((p) => join(process.cwd(), p))
    .find((p) => existsSync(p));

  if (configPath) {
    const loadConfig = jiti(process.cwd(), { interopDefault: true });
    const mod = loadConfig(configPath);
    return mod.default || mod;
  }

  return inferSchemaFromEnv(localEnv);
}
