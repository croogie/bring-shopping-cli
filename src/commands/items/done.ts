import {Args, Command, Flags} from '@oclif/core'

import type {OutputFormat} from '../../lib/types.js'

import {createAuthenticatedClient} from '../../lib/client.js'
import {resolveCredentials} from '../../lib/config.js'
import {renderDoneItem} from '../../lib/output.js'
import {normalizeLocale, resolveDefaultLocale, resolveList, translateItemName} from '../../lib/utils.js'

export default class ItemsDone extends Command {
  static args = {
    list: Args.string({
      description: 'Bring list UUID or exact list name.',
      required: true,
    }),
    name: Args.string({
      description: 'Item name to mark as done.',
      required: true,
    }),
  }
  static description = 'Mark a Bring shopping list item as done'
  static examples = [
    `<%= config.bin %> <%= command.id %> list-1 Milk
Marked Milk as done in Groceries (list-1)
`,
    `<%= config.bin %> <%= command.id %> Groceries Mleko --locale pl-PL
Marked Mleko as done in Groceries (list-1); matched as: Milk
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
      description: 'Send the raw item name without loading translations.',
    }),
    password: Flags.string({
      description: 'Bring account password. Defaults to BRING_PASSWORD.',
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(ItemsDone)
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
          `Cannot load Bring translations for locale ${locale}: ${message}. Pass --locale with a supported locale or --no-translate to send the raw name.`,
        )
      }
    }

    const translatedName = translateItemName(args.name, translations)
    await client.moveToRecentList(list.listUuid, translatedName.name)

    this.log(
      renderDoneItem(
        {
          listName: list.name,
          listUuid: list.listUuid,
          name: translatedName.name,
          originalName: translatedName.originalName,
        },
        flags.format as OutputFormat,
      ),
    )
  }
}
