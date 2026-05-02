import {Args, Command, Flags} from '@oclif/core'

import type {ItemSection, OutputFormat} from '../lib/types.js'

import {createAuthenticatedClient} from '../lib/client.js'
import {resolveCredentials} from '../lib/config.js'
import {renderItems} from '../lib/output.js'
import {flattenItems, normalizeLocale, resolveDefaultLocale, resolveList} from '../lib/utils.js'

export default class Items extends Command {
  static args = {
    list: Args.string({
      description: 'Bring list UUID or exact list name.',
      required: true,
    }),
  }
  static description = 'List Bring shopping list items'
  static examples = [
    `<%= config.bin %> <%= command.id %> list-1
Section   Name   Specification
purchase  Milk   2 liters
`,
    `<%= config.bin %> <%= command.id %> Groceries --locale de-DE --format json
[
  {
    "section": "purchase",
    "name": "Milch",
    "originalName": "Milk",
    "specification": "2 liters"
  }
]
    `,
  ]
  static flags = {
    email: Flags.string({
      description: 'Bring account email. Defaults to BRING_EMAIL.',
    }),
    format: Flags.string({
      default: 'text',
      description: 'Output format.',
      options: ['text', 'tsv', 'csv', 'json'],
    }),
    locale: Flags.string({
      description: 'Translation locale. Defaults to the current system locale.',
    }),
    'no-translate': Flags.boolean({
      default: false,
      description: 'Print raw Bring item names without loading translations.',
    }),
    password: Flags.string({
      description: 'Bring account password. Defaults to BRING_PASSWORD.',
    }),
    section: Flags.string({
      default: 'all',
      description: 'Item section to print.',
      options: ['all', 'purchase', 'recently'],
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Items)
    const credentials = resolveCredentials(flags)
    const client = await createAuthenticatedClient(credentials)
    const {lists} = await client.loadLists()
    const list = resolveList(lists, args.list)
    const locale = flags.locale ? normalizeLocale(flags.locale) : resolveDefaultLocale()

    let translations: Record<string, string> | undefined
    if (!flags['no-translate']) {
      try {
        translations = await client.loadTranslations(locale)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        throw new Error(
          `Cannot load Bring translations for locale ${locale}: ${message}. Pass --locale with a supported locale or --no-translate to print raw names.`,
        )
      }
    }

    const items = await client.getItems(list.listUuid)
    const rows = flattenItems(items, flags.section as ItemSection, translations)

    this.log(renderItems(rows, flags.format as OutputFormat))
  }
}
