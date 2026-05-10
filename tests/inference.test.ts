import { describe, it, expect } from "vitest";
import { inferSchemaFromEnv } from "../src/validators/inference";

describe("inference", () => {
  it("infers numbers correctly", () => {
    const schema = inferSchemaFromEnv({ PORT: "3000" });
    const result = schema.parse({ PORT: "3000" });
    expect(typeof result.PORT).toBe("number");
    expect(result.PORT).toBe(3000);
  });

  it("infers booleans correctly", () => {
    const schema = inferSchemaFromEnv({ DEBUG: "true", ENABLED: "false" });
    const result = schema.parse({ DEBUG: "true", ENABLED: "false" });
    expect(result.DEBUG).toBe(true);
    expect(result.ENABLED).toBe(false);
  });

  it("infers arrays from comma-separated strings", () => {
    const schema = inferSchemaFromEnv({ FEATURES: "a,b,c" });
    const result = schema.parse({ FEATURES: "a,b,c" });
    expect(Array.isArray(result.FEATURES)).toBe(true);
    expect(result.FEATURES).toEqual(["a", "b", "c"]);
  });

  it("infers strings for everything else", () => {
    const schema = inferSchemaFromEnv({ NAME: "envdeck", VERSION: "v1.0.0" });
    const result = schema.parse({ NAME: "envdeck", VERSION: "v1.0.0" });
    expect(result.NAME).toBe("envdeck");
    expect(result.VERSION).toBe("v1.0.0");
  });

  it("handles JSON strings (scaffolded)", () => {
    const schema = inferSchemaFromEnv({ DATA: '{"key":"value"}' });
    const result = schema.parse({ DATA: '{"key":"value"}' });
    // In our current implementation ZodString is fallback for complex JSON if not handled specifically
    // But it should at least not crash.
    expect(result.DATA).toBe('{"key":"value"}');
  });
});
