# Repository Guidelines

## Project Structure & Module Organization

This repository contains an oclif-based TypeScript CLI named `bring-cli`.
Source code lives in `src/`, with command implementations under
`src/commands/` (for example, `src/commands/hello/world.ts`). Tests mirror the
source layout under `test/`, using `*.test.ts` files. Runtime entrypoints are in
`bin/`, while compiled output is generated into `dist/` and should not be edited
directly. Project configuration is kept at the root: `package.json`,
`tsconfig.json`, `eslint.config.mjs`, `.mocharc.json`, and `.prettierrc.json`.

## Build, Test, and Development Commands

- `pnpm install`: install dependencies from `pnpm-lock.yaml`.
- `pnpm run build`: remove `dist/` and compile TypeScript with `tsc -b`.
- `pnpm test`: run Mocha tests from `test/**/*.test.ts`; `posttest` also runs
  linting.
- `pnpm run lint`: run ESLint using the oclif and Prettier-compatible config.
- `node ./bin/run.js --help`: run the local CLI entrypoint after building.
- `node ./bin/dev.js hello world`: run a command in development mode.

## Coding Style & Naming Conventions

Use TypeScript ES modules and follow the existing oclif command patterns. Command
files should match their CLI topic path, such as `src/commands/hello/index.ts`
for `bring hello PERSON` and `src/commands/hello/world.ts` for
`bring hello world`. Tests should use the same path structure under `test/`.
Formatting is governed by `@oclif/prettier-config`; linting is configured in
`eslint.config.mjs`. Prefer clear command names, explicit flags, and concise
help text because README command documentation is generated from oclif metadata.

## Testing Guidelines

Tests use Mocha, Chai, and `@oclif/test` with `ts-node` via `.mocharc.json`.
Name test files `*.test.ts` and colocate them by feature path under `test/`.
Cover command output, required flags, argument handling, and failure cases for
new commands. Run `pnpm test` before submitting changes; run `pnpm run build`
when command metadata, exports, or TypeScript types change.

## Commit & Pull Request Guidelines

Recent history uses concise Conventional Commit-style messages, often with a
scope, such as `feat(yabai): ...`, `chore(nvim): ...`, and `feat: ...`. Use
`feat`, `fix`, `chore`, `docs`, or `test` as appropriate, and include a scope
when it clarifies the affected area. Pull requests should describe the behavior
change, list verification commands run, link related issues, and include CLI
output examples when command behavior changes.

## Release & Generated Files

`prepack` runs `oclif manifest && oclif readme`; `version` regenerates the
README and stages it. Do not hand-edit generated command sections in `README.md`
unless you also update the corresponding command source.
