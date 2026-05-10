import { existsSync } from "fs";
import { join } from "path";
import { config } from "dotenv";
import { expand } from "dotenv-expand";

export interface LoadEnvOptions {
  mode?: string;
  cwd?: string;
}

export interface LoadEnvResult {
  full: Record<string, string>;
  local: Record<string, string>;
}

export function loadEnv(options: LoadEnvOptions = {}): LoadEnvResult {
  const mode = options.mode || process.env.NODE_ENV || "development";
  const cwd = options.cwd || process.cwd();

  const envFiles = [
    `.env.${mode}.local`,
    `.env.${mode}`,
    `.env.local`,
    `.env`,
  ];

  const localEnv: Record<string, string> = {};

  for (const file of envFiles) {
    const filePath = join(cwd, file);
    if (existsSync(filePath)) {
      const parsed = config({ path: filePath }).parsed || {};
      Object.assign(localEnv, parsed);
    }
  }

  // Also include process.env for overrides in the 'full' version
  const mergedEnv = { ...localEnv, ...process.env } as Record<string, string>;
  
  // Expand variables with a simple protection (dotenv-expand is limited here)
  // We'll wrap it in a try-catch for now to prevent crashes
  try {
    const expandedFull = expand({ parsed: mergedEnv }).parsed || mergedEnv;
    const expandedLocal = expand({ parsed: { ...localEnv } }).parsed || localEnv;
    
    return {
      full: expandedFull as Record<string, string>,
      local: expandedLocal as Record<string, string>,
    };
  } catch {
    console.error("⚠️ Error expanding environment variables. Check for circular references.");
    return { full: mergedEnv, local: localEnv };
  }
}

