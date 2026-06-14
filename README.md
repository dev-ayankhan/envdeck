# envdeck 🛡️

**The production-grade environment variable manager with runtime validation for JavaScript and TypeScript. Safely validate, parse, and manage environment variables across runtimes with dotenv compatibility and modern framework support.**

[![npm version](https://img.shields.io/npm/v/envdeck.svg)](https://www.npmjs.com/package/envdeck)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/envdeck.svg)](https://www.npmjs.com/package/envdeck)

`envdeck` ensures your application's environment variables are **runtime-safe** and **type-safe**. It validates your environment variables and automatically generates TypeScript types, providing a seamless developer experience with zero runtime overhead.

---

## ✨ Features

- 💎 **Type-Safe by Default**: Automatically infers types and generates native TypeScript definitions.
- ✅ **Schema Validation**: Use the full power of Zod to validate your environment variables.
- 🚀 **Runtime Safety**: Catch configuration errors at startup before they reach production.
- 🔒 **Frontend Protection**: Safely separate public and private variables for Next.js and Vite.
- 📦 **Monorepo Support**: Workspace-aware configuration that scales with your project.
- 🖥️ **CLI Suite**: Powerful tools for initialization, type generation, and validation.

---

## 🚀 Quick Start

### 1. Install

```bash
npm install envdeck
```

### 2. Initialize

Bootstrap your project and setup the environment structure:

```bash
npx envdeck init
```

### 3. Usage (Zero-Config)

Just add variables to your `.env`:

```env
PORT=3000
DEBUG=true
FEATURES=auth,billing,api
```

Import and use:

```ts
import { env } from "envdeck/runtime";

// Inferred as number
const port = env.PORT;

// Inferred as boolean
if (env.DEBUG) { ... }

// Inferred as string[]
env.FEATURES.forEach(f => console.log(f));
```

---

## 🛠️ Schema Mode (Recommended for Production)

Define your environment in `envdeck.config.ts`:

```ts
import { createEnv, z } from "envdeck";

export default createEnv({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
  STRIPE_KEY: z.string().startsWith("sk_"),
});
```

### 4. Use in Your Code

Import your validated, type-safe environment variables from the generated runtime:

```ts
import { env } from "envdeck/runtime";

// Inferred as number
const port = env.PORT;

// Inferred as "development" | "production" | "test"
if (env.NODE_ENV === "production") {
  // ...
}
```

---

## 🖥️ CLI Reference

| Command            | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| `envdeck init`     | Bootstraps the project and adds `.envdeck/` to `.gitignore`.      |
| `envdeck types`    | Scans your environment and generates TypeScript types.            |
| `envdeck setup`    | Interactively prompts for missing variables using your schema.    |
| `envdeck validate` | Validates current environment against your schema.                |
| `envdeck example`  | Generates a safe `.env.example` with masked secrets.              |
| `envdeck dev`      | Watch mode: Auto-regenerates types as you edit `.env`.            |
| `envdeck docs`     | Generates beautiful Markdown/JSON documentation.                  |
| `envdeck doctor`   | Checks your environment and provides suggestions for improvement. |

---

## 🛠️ Advanced Examples

### Complex Validation

Leverage Zod's full power for complex environment configurations:

```ts
const env = createEnv({
  // Transform strings to arrays automatically
  ADMIN_EMAILS: z.string().transform((s) => s.split(",")),
  // Custom regex and default values
  API_TIMEOUT: z
    .string()
    .regex(/^\d+ms$/)
    .default("5000ms"),
});
```

### Frontend Framework Integration

`envdeck` automatically identifies public variables based on your framework:

```ts
// envdeck.config.ts
export const env = createEnv({
  // Exposed to client-side (Next.js)
  NEXT_PUBLIC_API_URL: z.string().url(),
  // Hidden from client-side
  DATABASE_SECRET: z.string(),
});
```

---

## ⚖️ Comparison

| Feature             | `dotenv` | `envalid` | `envdeck` |
| ------------------- | :------: | :-------: | :-------: |
| **Type Inference**  |    ❌    |    ⚠️     |    ✅     |
| **Zod Support**     |    ❌    |    ❌     |    ✅     |
| **Type Generation** |    ❌    |    ❌     |    ✅     |
| **CLI Tools**       |    ❌    |    ❌     |    ✅     |
| **Frontend Safety** |    ❌    |    ❌     |    ✅     |

---

## 🔒 Security & Frontend Safety

`envdeck` strictly separates public and private variables. Variables prefixed with `PUBLIC_`, `VITE_`, or `NEXT_PUBLIC_` are safely identified as public.

When generating examples or docs, `envdeck` automatically masks keys matching:

- `SECRET`
- `KEY`
- `TOKEN`
- `PASSWORD`

---

## 🏗️ Architecture

`envdeck` works by generating a local `.envdeck/` directory in your project root.
This directory contains:

- `generated/env.d.ts`: A global module augmentation file that strongly types the `envdeck/runtime` module.

**Why physical files & module augmentation?**

1. **Zero Wrapper Imports**: You import directly from `"envdeck/runtime"`, and TypeScript magically infers the types globally.
2. **Zero Runtime Overhead**: No AST parsing or complex proxies at runtime.
3. **Perfect IDE Support**: VSCode and other IDEs pick up the generated types instantly.

> [!IMPORTANT]
> Because the generated types are placed inside a hidden folder (`.envdeck/`), you **must** tell TypeScript to include it. Ensure your `tsconfig.json` contains:
>
> ```json
> {
>   "include": ["src/**/*", ".envdeck/generated/**/*"]
> }
> ```

---

## 🎨 Framework Compatibility

`envdeck` is designed to be bundler-agnostic and works seamlessly with:

- **Next.js**: Use `NEXT_PUBLIC_` for client-side variables.
- **Vite**: Use `VITE_` prefix for frontend injection.
- **Express/NestJS**: Full backend support with zero-latency singleton access.
- **Remix/Astro**: Works in both SSR and static generation phases.

---

## 🏗️ Production Notes

### CI/CD Integration

Run validation in your CI pipeline to catch configuration errors early:

```bash
npx envdeck validate --ci
```

### Monorepo Support

`envdeck` is workspace-aware. Run `envdeck types` inside each package to generate local typings that respect workspace boundaries.

### Security Model

- **Masking**: Secrets are automatically stripped from `.env.example` and documentation.
- **Isolation**: Types are generated only for variables found in your project's `.env`, preventing system-wide environment pollution.
- **Immutability**: The `env` object is frozen at runtime to prevent accidental modifications.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📜 License

MIT © Ayan
