# bring-shopping-cli

Command-line client for Bring shopping lists.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/bring-shopping-cli.svg)](https://npmjs.org/package/bring-shopping-cli)
[![Downloads/week](https://img.shields.io/npm/dw/bring-shopping-cli.svg)](https://npmjs.org/package/bring-shopping-cli)

`bring-shopping-cli` is an oclif-based CLI for reading and updating Bring shopping lists from a
terminal. It authenticates with a Bring account, lists available shopping lists, and prints, adds,
or marks shopping list items as done in text or machine-readable formats.

## Requirements

- Node.js 18 or newer
- A Bring account

## Installation

Install the package globally from npm:

```sh
npm install -g bring-shopping-cli
```

Then run:

```sh
bring --help
```

For local development, install dependencies and run commands through the development entrypoint:

```sh
pnpm install
node ./bin/dev.js lists
```

## Authentication

Commands that call the Bring API need your Bring account credentials. The recommended setup is
to provide them through environment variables:

```sh
export BRING_EMAIL="user@example.com"
export BRING_PASSWORD="your-password"
```

You can also pass credentials per command:

```sh
bring lists --email user@example.com --password your-password
```

Environment variables are preferred because they keep credentials out of command history and make
repeated usage simpler. This CLI does not currently store credentials or session tokens.

## Commands

### `bring lists`

Prints the shopping lists available to the authenticated Bring account.

```sh
bring lists
```

Default text output:

```text
Name       UUID    Theme
Groceries  list-1  ch.publisheria.bring.theme.home
```

Supported flags:

- `--email <value>`: Bring account email. Defaults to `BRING_EMAIL`.
- `--password <value>`: Bring account password. Defaults to `BRING_PASSWORD`.
- `--format text|json|csv|tsv`: Output format. Defaults to `text`.

Examples:

```sh
bring lists --format json
bring lists --format csv
bring lists --format tsv
```

List output fields are `name`, `listUuid`, and `theme`.

### `bring items LIST`

Prints items for one Bring shopping list. `LIST` can be either a list UUID or a case-insensitive
exact list name. If multiple lists share the same name, pass the UUID.

```sh
bring items list-1
bring items Groceries
```

Default text output:

```text
Section   Name   Specification
purchase  Milk   2 liters
recently  Eggs   10
```

Supported flags:

- `--email <value>`: Bring account email. Defaults to `BRING_EMAIL`.
- `--password <value>`: Bring account password. Defaults to `BRING_PASSWORD`.
- `--format text|json|csv|tsv`: Output format. Defaults to `text`.
- `--section all|purchase|recently`: Item section to print. Defaults to `all`.
- `--locale <value>`: Translation locale. Defaults to the current system locale.
- `--no-translate`: Print raw Bring item names without loading translations.

Examples:

```sh
bring items Groceries --section purchase
bring items list-1 --no-translate
bring items Groceries --locale de-DE --format json
```

Translated item output includes `originalName` when Bring returns a translated name:

```json
[
  {
    "section": "purchase",
    "name": "Milch",
    "originalName": "Milk",
    "specification": "2 liters"
  }
]
```

Item output fields are `section`, `name`, `originalName`, and `specification`.

### `bring items add LIST NAME`

Adds or updates one item in a Bring shopping list. `LIST` can be either a list UUID or an exact list
name. By default, `NAME` is matched case-insensitively against Bring translations for the current
system locale. When a translated value matches, the source item name is saved with the casing
returned by Bring. If no translation exists, the raw name is saved with the casing passed on the
command line.

```sh
bring items add list-1 mleko
bring items add groceries mleko --spec "2 liters"
```

Default text output:

```text
Added mleko to Groceries (list-1); saved as: Milk; specification: 2 liters
```

Supported flags:

- `--email <value>`: Bring account email. Defaults to `BRING_EMAIL`.
- `--password <value>`: Bring account password. Defaults to `BRING_PASSWORD`.
- `--format text|json|csv|tsv`: Output format. Defaults to `text`.
- `--locale <value>`: Translation locale. Defaults to the current system locale.
- `--no-translate`: Save the raw item name without loading translations.
- `--spec <value>`: Item specification.

Examples:

```sh
bring items add groceries mleko --locale pl-PL
bring items add list-1 Bread --no-translate
bring items add Groceries Mleko --spec "2 liters" --format json
```

Added item output fields are `listUuid`, `listName`, `name`, `originalName`, and `specification`.

### `bring items done LIST NAME`

Marks one item in a Bring shopping list as done, moving it from the purchase section to the recent
items section. `LIST` can be either a list UUID or an exact list name. By default, `NAME` is matched
case-insensitively against Bring translations for the current system locale before sending the item
name to Bring. If no translation exists, the raw name is sent with the casing passed on the command
line.

```sh
bring items done list-1 mleko
bring items done groceries Milk --no-translate
```

Default text output:

```text
Marked mleko as done in Groceries (list-1); matched as: Milk
```

Supported flags:

- `--email <value>`: Bring account email. Defaults to `BRING_EMAIL`.
- `--password <value>`: Bring account password. Defaults to `BRING_PASSWORD`.
- `--format text|json|csv|tsv`: Output format. Defaults to `text`.
- `--locale <value>`: Translation locale. Defaults to the current system locale.
- `--no-translate`: Send the raw item name without loading translations.

Examples:

```sh
bring items done groceries mleko --locale pl-PL
bring items done list-1 Milk --no-translate
bring items done Groceries Mleko --format json
```

Done item output fields are `listUuid`, `listName`, `name`, and `originalName`.

## Output Formats

Bring commands that print structured data support the same output formats:

- `text`: readable table output for terminal usage
- `json`: pretty-printed JSON
- `csv`: comma-separated rows with a header
- `tsv`: tab-separated rows with a header

## Help

Use the built-in help command to inspect command usage:

```sh
bring help
bring help lists
bring help items
bring help items add
bring help items done
```

oclif also provides framework-level commands such as autocomplete and plugin management. They are
available through the runtime, but they are not part of the Bring shopping workflow documented here.

## Development

Common project commands:

```sh
pnpm run build
pnpm test
pnpm run lint
pnpm run format:check
```

Formatting is handled by Prettier using the existing oclif Prettier config. Staged files are
formatted automatically by the Husky pre-commit hook through `lint-staged`.
