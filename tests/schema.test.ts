import { describe, it, expect } from "vitest";
import { createEnv, z } from "../src/runtime";
import { validateEnv } from "../src/validators/inference";

describe("schema mode", () => {
  const schema = createEnv({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
  });

  it("validates correct environment variables", () => {
    const raw = {
      DATABASE_URL: "postgres://localhost:5432/db",
      NODE_ENV: "test",
    };
    const { success, data } = validateEnv(raw, schema);
    expect(success).toBe(true);
    expect(data.PORT).toBe(3000);
    expect(data.NODE_ENV).toBe("test");
  });

  it("fails on invalid URL", () => {
    const raw = {
      DATABASE_URL: "not-a-url",
      NODE_ENV: "test",
    };
    const { success, errors } = validateEnv(raw, schema);
    expect(success).toBe(false);
    expect(errors.DATABASE_URL).toBeDefined();
  });

  it("fails on invalid enum value", () => {
    const raw = {
      DATABASE_URL: "postgres://localhost:5432/db",
      NODE_ENV: "invalid",
    };
    const { success, errors } = validateEnv(raw, schema);
    expect(success).toBe(false);
    expect(errors.NODE_ENV).toBeDefined();
  });
});
