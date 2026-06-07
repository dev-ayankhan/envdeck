import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

type EnvSchema = z.ZodObject<Record<string, z.ZodType>>;

export function generateTypes(schema: EnvSchema, outDir: string) {
  const generatedDir = join(outDir, ".envdeck", "generated");
  if (!existsSync(generatedDir)) {
    mkdirSync(generatedDir, { recursive: true });
  }

  const shape = schema.shape;
  const keys = Object.keys(shape);

  // Generate env.d.ts
  const dtsContent = `
export interface EnvDeck {
${keys.map((key) => `  ${key}: ${getTsType(shape[key])};`).join("\n")}
}

export declare const env: EnvDeck;
`;
  writeFileSync(join(generatedDir, "env.d.ts"), dtsContent.trim());

  // Generate env.ts (runtime bridge)
  const tsContent = `
import { env as runtimeEnv } from "envdeck/runtime";
import { EnvDeck } from "./env.d";

export const env = runtimeEnv as unknown as EnvDeck;
`;
  writeFileSync(join(generatedDir, "env.ts"), tsContent.trim());

  // Generate JSON schema for docs/tools
  // zod-to-json-schema v3.x types predate Zod 4 — runtime call works, cast needed for TS
  const jsonSchema = (zodToJsonSchema as (s: unknown, name: string) => unknown)(
    schema,
    "EnvDeck",
  );
  writeFileSync(
    join(generatedDir, "env.schema.json"),
    JSON.stringify(jsonSchema, null, 2),
  );
}

function getTsType(zodType: z.ZodType): string {
  const def = zodType._def as any;
  const typeName = def?.typeName || def?.type;

  if (
    typeName === "default" ||
    typeName === "optional" ||
    typeName === "nullable" ||
    typeName === "ZodDefault" ||
    typeName === "ZodOptional" ||
    typeName === "ZodNullable"
  ) {
    return getTsType(def.innerType);
  }

  switch (typeName) {
    case "string":
    case "ZodString":
      return "string";
    case "number":
    case "ZodNumber":
      return "number";
    case "boolean":
    case "ZodBoolean":
      return "boolean";
    case "enum":
    case "ZodEnum":
      return Object.values(def.entries ?? {})
        .map((v) => `"${v}"`)
        .join(" | ");
    case "array":
    case "ZodArray":
      const innerArrayType = def.element ?? def.type;
      return innerArrayType
        ? `Array<${getTsType(innerArrayType)}>`
        : "unknown[]";
    case "pipe":
    case "ZodEffects":
    case "unknown":
    case "ZodUnknown":
      return "unknown";
    default:
      return "unknown";
  }
}
