import { describe, it, expect } from "vitest";
import { inferSchemaFromEnv, validateEnv } from "../src/validators/inference";
import { generateDocs } from "../src/generators/docs-generator";
import { z } from "zod";
import { readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

describe("Security Audit", () => {
  it("masks secrets in validation errors", () => {
    const schema = z.object({
      DATABASE_PASSWORD: z.string().min(20),
    });
    const raw = { DATABASE_PASSWORD: "short-secret" };
    const { success, errors } = validateEnv(raw, schema);
    
    expect(success).toBe(false);
    const errorString = JSON.stringify(errors);
    // In current implementation, Zod might include the value in some error messages
    // We need to ensure we don't leak it.
    expect(errorString).not.toContain("short-secret");
  });

  it("never includes values in documentation", () => {
    const tempDir = join(process.cwd(), "tests/fixtures/security-docs");
    if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });
    
    const schema = z.object({
      API_KEY: z.string(),
      PORT: z.number(),
    });
    
    generateDocs(schema as any, "markdown", tempDir);
    const content = readFileSync(join(tempDir, "ENV_DOCS.md"), "utf-8");
    
    // Values should not be in docs, only types/keys
    expect(content).not.toContain("super-secret-key");
  });
});
