import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "child_process";
import { existsSync, rmSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

describe("CLI", () => {
  const testDir = join(process.cwd(), "tests/fixtures/cli-test");
  const binPath = join(process.cwd(), "dist/cli/index.js");

  beforeAll(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true });
    mkdirSync(testDir, { recursive: true });
    writeFileSync(join(testDir, ".env"), "PORT=3000\nDATABASE_URL=postgres://localhost\nJWT_SECRET=supersecret\n");
  });

  it("envdeck init creates necessary files", () => {
    // We run in a separate dir to avoid polluting the main project
    execSync(`node ${binPath} init`, { cwd: testDir });
    expect(existsSync(join(testDir, ".env"))).toBe(true);
  });

  it("envdeck validate succeeds on valid env", () => {
    const output = execSync(`node ${binPath} validate`, { cwd: testDir }).toString();
    expect(output).toContain("Environment variables are valid");
  });

  it("envdeck types generates files", () => {
    execSync(`node ${binPath} types`, { cwd: testDir });
    expect(existsSync(join(testDir, ".envdeck/generated/env.d.ts"))).toBe(true);
  });

  it("envdeck example masks secrets", () => {
    execSync(`node ${binPath} example`, { cwd: testDir });
    const exampleContent = execSync(`cat ${join(testDir, ".env.example")}`).toString();
    expect(exampleContent).toContain("JWT_SECRET=");
    expect(exampleContent).not.toContain("supersecret");
    expect(exampleContent).toContain("PORT=3000");
  });

  it("envdeck docs generates markdown", () => {
    execSync(`node ${binPath} docs`, { cwd: testDir });
    expect(existsSync(join(testDir, "ENV_DOCS.md"))).toBe(true);
  });

  it("envdeck init updates .gitignore", () => {
    const gitignorePath = join(testDir, ".gitignore");
    writeFileSync(gitignorePath, "node_modules\n");
    execSync(`node ${binPath} init`, { cwd: testDir });
    const content = execSync(`cat ${gitignorePath}`).toString();
    expect(content).toContain(".envdeck/generated");
  });
});
