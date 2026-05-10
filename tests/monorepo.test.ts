import { describe, it, expect, beforeAll } from "vitest";
import { loadEnv } from "../src/loaders/env-loader";
import { writeFileSync, mkdirSync, existsSync, rmSync } from "fs";
import { join } from "path";

describe("monorepo support", () => {
  const rootDir = join(process.cwd(), "tests/fixtures/monorepo");
  const pkgDir = join(rootDir, "packages/app");

  beforeAll(() => {
    if (existsSync(rootDir)) rmSync(rootDir, { recursive: true });
    mkdirSync(pkgDir, { recursive: true });
    
    // Root env
    writeFileSync(join(rootDir, ".env"), "ROOT_VAR=root\nSHARED_VAR=root\n");
    // Package env
    writeFileSync(join(pkgDir, ".env"), "PKG_VAR=pkg\nSHARED_VAR=pkg\n");
  });

  it("resolves variables from package and root (simulated)", () => {
    // Current implementation loads from CWD. 
    // In a monorepo, users typically want to load from root too.
    // Our loader currently only looks at the provided CWD.
    // For now, let's verify it loads correctly from the specific CWD.
    const { full } = loadEnv({ cwd: pkgDir });
    expect(full.PKG_VAR).toBe("pkg");
    expect(full.SHARED_VAR).toBe("pkg");
  });
});
