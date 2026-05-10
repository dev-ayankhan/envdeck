import { writeFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

// Zod 4 internal def shape (simplified to what we access)
type ZodDef = { type: string };

type EnvSchema = z.ZodObject<Record<string, z.ZodType>>;

export function generateDocs(schema: EnvSchema, format: "markdown" | "json" | "html", outDir: string) {
  const shape = schema.shape;
  const keys = Object.keys(shape);

  if (format === "markdown") {
    let md = "# Environment Variables\n\n";
    md += "| Variable | Type | Required | Description |\n";
    md += "|----------|------|----------|-------------|\n";

    for (const key of keys) {
      const zodType = shape[key];
      const def = zodType._def as ZodDef;
      const isOptional = zodType instanceof z.ZodOptional;
      md += `| \`${key}\` | \`${def.type}\` | \`${!isOptional}\` | - |\n`;
    }

    writeFileSync(join(outDir, "ENV_DOCS.md"), md);
  } else if (format === "json") {
    const json = {
      variables: keys.map(key => {
        const zodType = shape[key];
        const def = zodType._def as ZodDef;
        return {
          name: key,
          type: def.type,
          required: !(zodType instanceof z.ZodOptional),
        };
      })
    };
    writeFileSync(join(outDir, "ENV_DOCS.json"), JSON.stringify(json, null, 2));
  }
}
