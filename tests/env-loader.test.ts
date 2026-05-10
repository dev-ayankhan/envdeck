import { describe, it, expect, beforeEach } from "vitest";
import { loadEnv } from "../src/loaders/env-loader";
import { join } from "path";

describe("env-loader", () => {
  const fixtureDir = join(process.cwd(), "tests/fixtures/precedence");

  beforeEach(() => {
    // Clear process.env keys we are testing to avoid leaks
    delete process.env.VAR1;
    delete process.env.VAR2;
    delete process.env.VAR3;
    delete process.env.VAR4;
    delete process.env.EXPANDED_VAR;
  });

  it("loads env files in correct priority order", () => {
    const { full } = loadEnv({ cwd: fixtureDir, mode: "development" });

    expect(full.VAR1).toBe("base");
    expect(full.VAR2).toBe("local");
    expect(full.VAR3).toBe("dev");
    expect(full.VAR4).toBe("dev-local");
  });

  it("supports variable expansion", () => {
    const { full } = loadEnv({ cwd: fixtureDir, mode: "development" });
    expect(full.EXPANDED_VAR).toBe("http://localhost:base");
  });

  it("handles missing files gracefully", () => {
    const { full } = loadEnv({ cwd: join(process.cwd(), "non-existent"), mode: "development" });
    expect(full).toBeDefined();
    // Should still have process.env
    expect(full.PATH).toBeDefined();
  });

  it("allows process.env to override file values", () => {
    process.env.VAR1 = "override";
    const { full } = loadEnv({ cwd: fixtureDir, mode: "development" });
    expect(full.VAR1).toBe("override");
  });

  it("isolates project variables from system environment", () => {
    process.env.SYSTEM_VAR = "secret";
    const { local } = loadEnv({ cwd: fixtureDir });
    expect(local.SYSTEM_VAR).toBeUndefined();
    expect(local.VAR1).toBe("base");
  });
});
