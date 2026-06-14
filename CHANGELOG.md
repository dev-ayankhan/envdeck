# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-06-14

### Changed

- **Architectural Update**: Switched from generating a physical `env.ts` wrapper file to a cleaner **Global Module Augmentation** approach (`env.d.ts`). This allows consumers to directly `import { env } from "envdeck/runtime"` without jumping through an intermediate wrapper, providing a vastly superior developer experience.
- The `envdeck types` generator and `envdeck doctor` logic have been updated to support the new `env.d.ts` module augmentation file.
- Test suites have been updated to reflect the removal of `env.ts`.

### Added

- Included `typesVersions` fallback inside `package.json` to ensure out-of-the-box TypeScript compatibility for legacy projects using `"moduleResolution": "node"` or CommonJS.

### Documentation

- Added a warning in `README.md` clarifying that users must include `.envdeck/generated/**/*` inside their `tsconfig.json` `include` array for the module augmentation to correctly resolve.

## [1.0.4] - 2026-06-07

### Fixed

- Fixed `unknown` type.
- Added type generation support for Zod `array` schemas (both Zod 3 and Zod 4 syntax), recursively inferring the inner type to output exact types (e.g., `Array<string>`) instead of `unknown`.

### Added

- **Interactive Scaffolding**: Introduced the `envdeck setup` CLI command. It interactively prompts developers for any missing environment variables based on their envdeck config schema, validates the input on the fly, and smartly auto-saves it to `.env` or `.env.local` without unnecessary empty lines.

## [1.0.3] - 2026-06-07

### Fixed

- Fixed a circular dependency issue during config loading by implementing a Lazy-Initialized Target Proxy for the `env` object, preventing `Maximum call stack size exceeded` errors.
- Fixed an edge-case bug where `jiti`'s default export unwrap conflicted with `ZodObject.prototype.default`, ensuring the proper Zod schema is loaded.
- Updated schema inference and type generation to fully support Zod v4 architectures.

## [1.0.2] - 2026-06-07

### Fixed

- Fixed an issue where the `envdeck.config.ts` schema file was being ignored in favor of zero-config `.env` inference, breaking the strongly-typed Schema Mode.
- Refactored `src/runtime/index.ts` and `src/cli/index.ts` to correctly respect and load user-defined schemas during runtime and CLI operations (`types`, `validate`, `docs`, `dev`).

### Added

- Integrated `jiti` as a dependency to dynamically parse and evaluate TypeScript/JavaScript configuration files (`envdeck.config.ts`, `env.config.js`) on the fly.

## [1.0.1] - 2026-05-16

### Changed

- Improved npm metadata and SEO discoverability.
- Enhanced documentation with badges, comparisons, and advanced usage examples.
- Optimized package keywords for better search ranking.
- Added repository, homepage, and bugs fields to package configuration.
- Enabled npm provenance support for secure publishing.

## [1.0.0] - 2026-05-10

### Added

- Initial production release.
- Zero-config environment variable inference.
- Zod-based schema validation.
- Dynamic TypeScript type generation into `.envdeck/`.
- CLI suite: `init`, `validate`, `types`, `docs`, `example`, `dev`, `doctor`.
- Cross-platform support (macOS, Linux, Windows).
- Monorepo and workspace awareness.
- Frontend/Backend variable isolation.
- Automatic secret masking in example files.
