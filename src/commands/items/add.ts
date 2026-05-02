import {Args, Command, Flags} from '@oclif/core'

import type {OutputFormat} from '../../lib/types.js'

import {createAuthenticatedClient} from '../../lib/client.js'
import {resolveCredentials} from '../../lib/config.js'
import {renderAddedItem} from '../../lib/output.js'
import {normalizeLocale, resolveDefaultLocale, resolveList, translateItemName} from '../../lib/utils.js'

export default class ItemsAdd extends Command {
  static args = {
    list: Args.string({
      description: 'Bring list UUID or exact list name.',
      required: true,
    }),
    name: Args.string({
      description: 'Item name to add or update.',
      required: true,
    }),
  }
  static description = 'Add or update a Bring shopping list item'
  static examples = [
    `<%= config.bin %> <%= command.id %> list-1 Milk
Added Milk to Groceries (list-1)
`,
    `<%= config.bin %> <%= command.id %> Groceries Milk --spec "2 liters" --locale pl-PL
Added Milk to Groceries (list-1); saved as: Mleko; specification: 2 liters
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
      description: 'Save the raw item name without loading translations.',
    }),
    password: Flags.string({
      description: 'Bring account password. Defaults to BRING_PASSWORD.',
    }),
    spec: Flags.string({
      default: '',
      description: 'Item specification.',
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(ItemsAdd)
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
          `Cannot load Bring translations for locale ${locale}: ${message}. Pass --locale with a supported locale or --no-translate to save the raw name.`,
        )
      }
    }

    const translatedName = translateItemName(args.name, translations)
    await client.saveItem(list.listUuid, translatedName.name, flags.spec)

    this.log(
      renderAddedItem(
        {
          listName: list.name,
          listUuid: list.listUuid,
          name: translatedName.name,
          originalName: translatedName.originalName,
          specification: flags.spec,
        },
        flags.format as OutputFormat,
      ),
    )
  }
}
