import { z } from "zod";

function zodDefType(zodType: z.ZodType): string {
  const def = zodType._def as { typeName?: string; type?: string } | undefined;
  return def?.typeName || def?.type || "unknown";
}

export function inferSchemaFromEnv(env: Record<string, string>) {
  const schema: Record<string, z.ZodType> = {};

  for (const [key, value] of Object.entries(env)) {
    if (value.toLowerCase() === "true" || value.toLowerCase() === "false") {
      schema[key] = z.string().transform((val) => val.toLowerCase() === "true");
    } else if (!isNaN(Number(value)) && value.trim() !== "") {
      schema[key] = z.coerce.number();
    } else if (
      value.includes(",") &&
      !value.startsWith("[") &&
      !value.startsWith("{")
    ) {
      schema[key] = z
        .string()
        .transform((val) => val.split(",").map((s) => s.trim()));
    } else {
      try {
        const parsed: unknown = JSON.parse(value);
        if (typeof parsed === "object" && parsed !== null) {
          schema[key] = z.unknown();
        } else {
          schema[key] = z.string();
        }
      } catch {
        schema[key] = z.string();
      }
    }
  }

  return z.object(schema);
}

export function validateEnv(
  env: Record<string, string>,
  schema: z.ZodObject<Record<string, z.ZodType>>,
) {
  const result = schema.safeParse(env);
  if (!result.success) {
    return {
      success: false as const,
      errors: result.error.format(),
    };
  }
  return {
    success: true as const,
    data: result.data,
  };
}

export { zodDefType };
