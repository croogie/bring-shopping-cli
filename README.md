# bring-shopping-cli

Command-line client for Bring shopping lists.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/bring-shopping-cli.svg)](https://npmjs.org/package/bring-shopping-cli)
[![Downloads/week](https://img.shields.io/npm/dw/bring-shopping-cli.svg)](https://npmjs.org/package/bring-shopping-cli)

`bring-shopping-cli` is an oclif-based CLI for working with the Bring shopping API from a
terminal. The current implementation can authenticate with a Bring account and
list available shopping lists in multiple output formats.

## Installation

Install the package globally from npm:

```sh
npm install -g bring-shopping-cli
```

Then run:

```sh
bring --help
```

The package requires Node.js 18 or newer.

## Authentication

Commands that call the Bring API need your Bring account credentials. The
recommended setup is to provide them through environment variables:

```sh
export BRING_EMAIL="user@example.com"
export BRING_PASSWORD="your-password"
```

You can also pass credentials per command:

```sh
bring lists --email user@example.com --password your-password
```

Environment variables are the preferred option because they keep credentials out
of command examples and make repeated usage simpler. This CLI does not currently
store credentials or session tokens.

## Implemented Commands

### `bring lists`

Lists the shopping lists available to the authenticated Bring account. By
default, output is formatted as a readable text table:

```sh
bring lists
```

Use `--format` to select a machine-readable format:

```sh
bring lists --format json
bring lists --format csv
bring lists --format tsv
bring lists --format text
```

Supported output fields are `name`, `listUuid`, and `theme`.

### `bring help`

Shows CLI help for all commands or a specific command:

```sh
bring help
bring help lists
```

### `bring plugins`

Plugin management commands are provided by `@oclif/plugin-plugins`. They are
available because this project currently includes oclif plugin support, even
though the main Bring functionality does not depend on user-installed plugins.

<!-- toc -->
* [bring-shopping-cli](#bring-shopping-cli)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g bring-shopping-cli
$ bring COMMAND
running command...
$ bring (--version)
bring-shopping-cli/0.1.0 darwin-arm64 node-v24.8.0
$ bring --help [COMMAND]
USAGE
  $ bring COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`bring autocomplete [SHELL]`](#bring-autocomplete-shell)
* [`bring help [COMMAND]`](#bring-help-command)
* [`bring items LIST`](#bring-items-list)
* [`bring lists`](#bring-lists)
* [`bring plugins`](#bring-plugins)
* [`bring plugins add PLUGIN`](#bring-plugins-add-plugin)
* [`bring plugins:inspect PLUGIN...`](#bring-pluginsinspect-plugin)
* [`bring plugins install PLUGIN`](#bring-plugins-install-plugin)
* [`bring plugins link PATH`](#bring-plugins-link-path)
* [`bring plugins remove [PLUGIN]`](#bring-plugins-remove-plugin)
* [`bring plugins reset`](#bring-plugins-reset)
* [`bring plugins uninstall [PLUGIN]`](#bring-plugins-uninstall-plugin)
* [`bring plugins unlink [PLUGIN]`](#bring-plugins-unlink-plugin)
* [`bring plugins update`](#bring-plugins-update)

## `bring autocomplete [SHELL]`

Display autocomplete installation instructions.

```
USAGE
  $ bring autocomplete [SHELL] [-r]

ARGUMENTS
  [SHELL]  (zsh|bash|powershell) Shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  Display autocomplete installation instructions.

EXAMPLES
  $ bring autocomplete

  $ bring autocomplete bash

  $ bring autocomplete zsh

  $ bring autocomplete powershell

  $ bring autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v3.2.46/src/commands/autocomplete/index.ts)_

## `bring help [COMMAND]`

Display help for bring.

```
USAGE
  $ bring help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for bring.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/6.2.45/src/commands/help.ts)_

## `bring items LIST`

List Bring shopping list items

```
USAGE
  $ bring items LIST [--email <value>] [--format text|tsv|csv|json] [--locale <value>] [--no-translate]
    [--password <value>] [--section all|purchase|recently]

ARGUMENTS
  LIST  Bring list UUID or exact list name.

FLAGS
  --email=<value>     Bring account email. Defaults to BRING_EMAIL.
  --format=<option>   [default: text] Output format.
                      <options: text|tsv|csv|json>
  --locale=<value>    Translation locale. Defaults to the current system locale.
  --no-translate      Print raw Bring item names without loading translations.
  --password=<value>  Bring account password. Defaults to BRING_PASSWORD.
  --section=<option>  [default: all] Item section to print.
                      <options: all|purchase|recently>

DESCRIPTION
  List Bring shopping list items

EXAMPLES
  $ bring items list-1
  Section   Name   Specification
  purchase  Milk   2 liters

  $ bring items Groceries --locale de-DE --format json
  [
    {
      "section": "purchase",
      "name": "Milch",
      "originalName": "Milk",
      "specification": "2 liters"
    }
  ]
```

_See code: [src/commands/items.ts](https://github.com/croogie/bring-shopping-cli/blob/v0.1.0/src/commands/items.ts)_

## `bring lists`

List Bring shopping lists

```
USAGE
  $ bring lists [--email <value>] [--format text|tsv|csv|json] [--password <value>]

FLAGS
  --email=<value>     Bring account email. Defaults to BRING_EMAIL.
  --format=<option>   [default: text] Output format.
                      <options: text|tsv|csv|json>
  --password=<value>  Bring account password. Defaults to BRING_PASSWORD.

DESCRIPTION
  List Bring shopping lists

EXAMPLES
  $ bring lists
  Name       UUID    Theme
  Groceries  list-1  ch.publisheria.bring.theme.home

  $ bring lists --format json
  [
    {
      "listUuid": "list-1",
      "name": "Groceries",
      "theme": "ch.publisheria.bring.theme.home"
    }
  ]
```

_See code: [src/commands/lists.ts](https://github.com/croogie/bring-shopping-cli/blob/v0.1.0/src/commands/lists.ts)_

## `bring plugins`

List installed plugins.

```
USAGE
  $ bring plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ bring plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.62/src/commands/plugins/index.ts)_

## `bring plugins add PLUGIN`

Installs a plugin into bring.

```
USAGE
  $ bring plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into bring.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the BRING_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the BRING_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ bring plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ bring plugins add myplugin

  Install a plugin from a github url.

    $ bring plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ bring plugins add someuser/someplugin
```

## `bring plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ bring plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ bring plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.62/src/commands/plugins/inspect.ts)_

## `bring plugins install PLUGIN`

Installs a plugin into bring.

```
USAGE
  $ bring plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into bring.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the BRING_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the BRING_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ bring plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ bring plugins install myplugin

  Install a plugin from a github url.

    $ bring plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ bring plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.62/src/commands/plugins/install.ts)_

## `bring plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ bring plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ bring plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.62/src/commands/plugins/link.ts)_

## `bring plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ bring plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ bring plugins unlink
  $ bring plugins remove

EXAMPLES
  $ bring plugins remove myplugin
```

## `bring plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ bring plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.62/src/commands/plugins/reset.ts)_

## `bring plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ bring plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ bring plugins unlink
  $ bring plugins remove

EXAMPLES
  $ bring plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.62/src/commands/plugins/uninstall.ts)_

## `bring plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ bring plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ bring plugins unlink
  $ bring plugins remove

EXAMPLES
  $ bring plugins unlink myplugin
```

## `bring plugins update`

Update installed plugins.

```
USAGE
  $ bring plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.62/src/commands/plugins/update.ts)_
<!-- commandsstop -->
