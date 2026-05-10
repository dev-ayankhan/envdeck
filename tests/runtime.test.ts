import { describe, it, expect } from "vitest";
import { env } from "../src/runtime";

describe("runtime", () => {
  it("exports a frozen env object", () => {
    expect(Object.isFrozen(env)).toBe(true);
  });

  it("throws when trying to mutate env", () => {
    // @ts-ignore
    expect(() => { env.NEW_VAR = "test"; }).toThrow();
  });

  it("is a singleton", async () => {
    const { env: env1 } = await import("../src/runtime");
    const { env: env2 } = await import("../src/runtime");
    expect(env1).toBe(env2);
  });
});
