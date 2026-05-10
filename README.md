# envdeck 🛡️

**The modern, type-safe standard for environment variable management.**

[![npm version](https://img.shields.io/npm/v/envdeck.svg)](https://www.npmjs.com/package/envdeck)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Release Status

| Version | Status | Notes                                                       |
| ------- | ------ | ----------------------------------------------------------- |
| 1.0.0   | Stable | Initial production release with full type generation & CLI. |

---

## ✨ Features

- 🚫 **Stop using `process.env`**: Say goodbye to `undefined` and type-casting.
- 💎 **Zero-Config Type Inference**: Automatically infers `number`, `boolean`, and `string[]` from your `.env`.
- ✅ **First-Class Zod Support**: Use the power of Zod for complex validation schemas.
- 🚀 **Dynamic Type Generation**: Generates native TypeScript definitions for perfect IntelliSense.
- 🔒 **Frontend Safety**: Built-in protection to prevent leaking server secrets to the client.
- 📦 **Monorepo Ready**: Workspace-aware environment resolution.
- 🛡️ **Production Grade**: Circular expansion protection, secret masking, and high-performance caching.

---

## 🚀 Quick Start

### 1. Install

```bash
npm install envdeck
```

### 2. Initialize

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

---

## 🖥️ CLI Reference

| Command           | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| `envdeck init`     | Bootstraps the project and adds `.envdeck/` to `.gitignore`. |
| `envdeck types`    | Scans your environment and generates types.                 |
| `envdeck validate` | Validates current environment against your schema.          |
| `envdeck example`  | Generates a safe `.env.example` with masked secrets.        |
| `envdeck docs`     | Generates beautiful Markdown/JSON documentation.            |
| `envdeck dev`      | Watch mode: Auto-regenerates types as you edit `.env`.      |

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

- `generated/env.d.ts`: The TypeScript interface for your environment.
- `generated/env.ts`: A bridge that connects the types to the runtime singleton.

**Why physical files?**

1. **Zero runtime overhead**: No AST parsing or complex proxies at runtime.
2. **Perfect IDE Support**: VSCode and other IDEs pick up the changes instantly.
3. **No magic**: Everything is standard TypeScript.

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

## 📜 License

MIT © [Ayan](https://github.com/dev-ayankhan/envdeck)
