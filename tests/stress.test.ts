import { describe, it, expect, beforeAll } from "vitest";
import { loadEnv } from "../src/loaders/env-loader";
import { inferSchemaFromEnv } from "../src/validators/inference";
import { generateTypes } from "../src/generators/type-generator";
import { writeFileSync, mkdirSync, existsSync, rmSync } from "fs";
import { join } from "path";

describe("Stress & Edge Cases", () => {
  const stressDir = join(process.cwd(), "tests/fixtures/stress");

  beforeAll(() => {
    if (existsSync(stressDir)) rmSync(stressDir, { recursive: true });
    mkdirSync(stressDir, { recursive: true });
  });

  it("handles a massive .env file (1000+ variables)", () => {
    let content = "";
    for (let i = 0; i < 1000; i++) {
      content += `VAR_${i}=value_${i}\n`;
    }
    writeFileSync(join(stressDir, ".env"), content);
    
    const start = performance.now();
    const { full } = loadEnv({ cwd: stressDir });
    const end = performance.now();
    
    expect(Object.keys(full).length).toBeGreaterThanOrEqual(1000);
    console.log(`Loaded 1000 vars in ${end - start}ms`);
  });

  it("prevents infinite circular variable expansion", () => {
    writeFileSync(join(stressDir, ".env.circular"), "A=${B}\nB=${A}\n");
    // dotenv-expand handles this, but we must ensure we don't crash
    const { full } = loadEnv({ cwd: stressDir, mode: "circular" });
    expect(full.A).toBeDefined();
  });

  it("handles malformed JSON and weird characters", () => {
    const weirdEnv = {
      JSON_FAIL: '{"broken": }',
      UNICODE: "🚀_星_⚡",
      MULTILINE: "line1\nline2",
      SHELL: 'eval $(rm -rf /)', // Should be treated as a literal string
    };
    const schema = inferSchemaFromEnv(weirdEnv);
    const result = schema.parse(weirdEnv);
    expect(result.UNICODE).toBe("🚀_星_⚡");
    expect(result.SHELL).toContain("eval");
  });

  it("recovers from missing generated directory", () => {
    const genDir = join(stressDir, ".envdeck");
    if (existsSync(genDir)) rmSync(genDir, { recursive: true });
    
    const rawEnv = { PORT: "3000" };
    const schema = inferSchemaFromEnv(rawEnv);
    
    expect(() => generateTypes(schema, stressDir)).not.toThrow();
    expect(existsSync(join(genDir, "generated/env.ts"))).toBe(true);
  });
});
