# Spec: Node/TypeScript Project Configuration

## Requirement: Configure Node.js + TypeScript project with modern tooling

### Scenario: Initialize project with pnpm, Biome, Vitest, Husky
- **GIVEN** a fresh repository with package.json
- **WHEN** running `pnpm install`
- **THEN** the project has:
  - package.json with scripts: build, dev, test, lint, format, typecheck, docs:dev, docs:build
  - tsconfig.json + tsconfig.build.json (strict, NodeNext modules, declaration maps)
  - biome.json (formatter + linter, single quotes, 100 cols, trailing commas)
  - vitest.config.ts (globals, node env, coverage with v8)
  - .husky/pre-commit (lint:fix, format, typecheck, test)
  - .prettierignore (dist/, node_modules/, coverage/, .turbo/)
- **AND** `pnpm lint && pnpm typecheck && pnpm test` all pass on empty src/

### Scenario: TypeScript strict configuration
- **GIVEN** tsconfig.json
- **WHEN** running `tsc --noEmit`
- **THEN** strict mode enabled, noUncheckedIndexedAccess, noImplicitOverride, exactOptionalPropertyTypes

### Scenario: Biome replaces ESLint + Prettier
- **GIVEN** biome.json with recommended rules
- **WHEN** running `biome check src`
- **THEN** lint + format in single tool, organizes imports, single quotes, 100 cols

---

## Non-goals
- ESLint/Prettier config (replaced by Biome)
- Changesets or automated npm publishing
- CodeQL (GitHub Advanced Security not available)

---

## Related GitHub Issues
- #7 chore: Node/TS config with pnpm, Biome, Vitest, Husky