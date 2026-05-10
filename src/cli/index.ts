#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { loadEnv } from "../loaders/env-loader";
import { inferSchemaFromEnv } from "../validators/inference";
import { generateTypes } from "../generators/type-generator";
import { generateDocs } from "../generators/docs-generator";
import { writeFileSync, existsSync, readFileSync, appendFileSync, watch } from "fs";
import { join } from "path";

const program = new Command();

program
  .name("envdeck")
  .description("Modern environment variable management for TypeScript")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize envdeck in the current directory")
  .action(() => {
    const spinner = ora("Initializing envdeck...").start();
    
    // Create .env if it doesn't exist
    if (!existsSync(".env")) {
      writeFileSync(".env", "PORT=3000\nNODE_ENV=development\n");
    }

    // Add to .gitignore if needed
    if (existsSync(".gitignore")) {
      const gitignorePath = join(process.cwd(), ".gitignore");
      const content = readFileSync(gitignorePath, "utf-8");
      if (!content.includes(".envdeck")) {
        appendFileSync(gitignorePath, "\n.envdeck/generated\n");
      }
    }

    spinner.succeed(chalk.green("envdeck initialized!"));
    console.log(chalk.blue("\nNext steps:"));
    console.log("1. Run " + chalk.bold("envdeck types") + " to generate typings");
    console.log("2. Import env from " + chalk.bold("envdeck/runtime"));
  });

program
  .command("types")
  .description("Generate TypeScript types from .env")
  .option("-m, --mode <mode>", "Environment mode", "development")
  .action((options) => {
    const spinner = ora("Generating types...").start();
    try {
      const { local } = loadEnv({ mode: options.mode });
      const schema = inferSchemaFromEnv(local);
      generateTypes(schema, process.cwd());
      spinner.succeed(chalk.green("Types generated in .envdeck/generated"));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      spinner.fail(chalk.red("Failed to generate types: " + message));
    }
  });

program
  .command("validate")
  .description("Validate environment variables")
  .option("--ci", "Fail hard on validation errors")
  .action((options) => {
    const { full, local } = loadEnv();
    const schema = inferSchemaFromEnv(local);
    
    // Warning for Zero-Config validation
    const configExists = ["envdeck.config.ts", "env.config.ts"].some(f => existsSync(f));
    if (!configExists) {
      console.warn(chalk.yellow("⚠️  Running validate in Zero-Config mode. Validation is limited to structural checks of current values.\n"));
    }

    const result = schema.safeParse(full);

    if (result.success) {
      console.log(chalk.green("✅ Environment variables are valid!"));
    } else {
      console.error(chalk.red("❌ Invalid environment variables\n"));
      // Beautiful formatting logic here
      if (options.ci) process.exit(1);
    }
  });

program
  .command("example")
  .description("Generate .env.example from current .env")
  .action(() => {
    const { local } = loadEnv();
    let content = "";
    for (const key of Object.keys(local)) {
      // Mask secrets
      const isSecret = /KEY|SECRET|TOKEN|PASSWORD/i.test(key);
      content += `${key}=${isSecret ? "" : local[key]}\n`;
    }
    writeFileSync(".env.example", content);
    console.log(chalk.green("Created .env.example"));
  });

program
  .command("docs")
  .description("Generate environment documentation")
  .option("-f, --format <format>", "Documentation format (markdown, json)", "markdown")
  .action((options) => {
    const spinner = ora("Generating documentation...").start();
    try {
      const { local } = loadEnv();
      const schema = inferSchemaFromEnv(local);
      generateDocs(schema, options.format, process.cwd());
      spinner.succeed(chalk.green(`Documentation generated in ENV_DOCS.${options.format === "markdown" ? "md" : "json"}`));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      spinner.fail(chalk.red("Failed to generate documentation: " + message));
    }
  });

program
  .command("dev")
  .description("Watch .env files and auto-regenerate types")
  .action(() => {
    console.log(chalk.blue("👀 envdeck is watching for changes..."));
    const watcher = (file: string) => {
      if (file.startsWith(".env")) {
        console.log(chalk.gray(`\nChange detected in ${file}. Regenerating types...`));
        try {
          const { local } = loadEnv();
          const schema = inferSchemaFromEnv(local);
          generateTypes(schema, process.cwd());
          console.log(chalk.green("✨ Types regenerated."));
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(chalk.red("❌ Failed to regenerate types: " + message));
        }
      }
    };
    
    // Simple watch logic
    watch(process.cwd(), (_: string, filename: string | null) => {
      if (filename) watcher(filename);
    });
  });

program
  .command("doctor")
  .description("Check for common environment issues")
  .action(() => {
    const spinner = ora("Running diagnostics...").start();
    const issues: string[] = [];

    if (!existsSync(".env")) issues.push("Missing .env file");
    if (!existsSync(".envdeck/generated/env.ts")) issues.push("Generated types not found. Run 'envdeck types'");
    
    if (existsSync(".gitignore")) {
      const gitignore = readFileSync(".gitignore", "utf-8");
      if (!gitignore.includes(".envdeck")) issues.push(".envdeck directory is not git-ignored");
    }

    if (issues.length === 0) {
      spinner.succeed(chalk.green("Everything looks perfect!"));
    } else {
      spinner.warn(chalk.yellow(`Found ${issues.length} potential issues:`));
      issues.forEach(issue => console.log(chalk.red(`- ${issue}`)));
    }
  });

program.parse();
