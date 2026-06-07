import { describe, it, expect, beforeAll } from "vitest";
import {
  existsSync,
  rmSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  appendFileSync,
} from "fs";
import { join } from "path";
import { spawnSync } from "child_process";

describe("CLI setup command", () => {
  const testDir = join(process.cwd(), "tests/fixtures/setup-test");
  const binPath = join(process.cwd(), "src/cli/index.ts");

  beforeAll(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true });
    mkdirSync(testDir, { recursive: true });

    // Create a mock envdeck.config.ts for the setup command
    writeFileSync(
      join(testDir, "envdeck.config.ts"),
      `
import { z } from "zod";
export default z.object({
  API_URL: z.string().url(),
  PORT: z.coerce.number().default(3000)
});
      `,
    );
  });

  it("interactively prompts for missing variables and validates input", async () => {
    const { spawn } = require("child_process");

    const result = await new Promise((resolve) => {
      const child = spawn("npx", ["tsx", binPath, "setup"], {
        cwd: testDir,
        env: { ...process.env },
      });

      let output = "";

      child.stdout.on("data", (data: any) => {
        const str = data.toString();
        output += str;

        if (str.includes("? Missing API_URL:")) {
          if (!output.includes("Invalid value")) {
            // First time it asks, send invalid
            child.stdin.write("not-a-url\n");
          } else {
            // Second time it asks (after invalid), send valid
            child.stdin.write("http://example.com\n");
          }
        } else if (str.includes("? Missing PORT")) {
          // Send empty string for optional port
          child.stdin.write("\n");
        }
      });

      child.stderr.on("data", (data: any) => {
        output += data.toString();
      });

      child.on("close", () => {
        resolve(output);
      });
    });

    const output = result as string;

    // Check if it detected missing variables
    expect(output).toContain("Found 2 missing environment variable(s)");

    // Check if it rejected the bad input
    expect(output).toContain("Invalid value");

    // Check if it added exactly 1 variable
    expect(output).toContain("Added 1 variables");

    // Check if .env was created and contains the correct value
    const envFile = join(testDir, ".env");
    expect(existsSync(envFile)).toBe(true);

    const envContent = readFileSync(envFile, "utf-8");
    expect(envContent).toContain("API_URL=http://example.com");
    expect(envContent).not.toContain("PORT="); // Port was skipped
  });

  it("exits early if everything is already defined", () => {
    // Write the remaining missing variable so everything is defined
    appendFileSync(join(testDir, ".env"), "PORT=8080\n");

    const result = spawnSync("npx", ["tsx", binPath, "setup"], {
      cwd: testDir,
      encoding: "utf-8",
    });

    const output = result.stdout + result.stderr;
    expect(output).toContain("All environment variables are already defined");
  });
});
