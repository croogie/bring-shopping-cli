import {Command, Flags} from '@oclif/core'

import {createAuthenticatedClient} from '../lib/client.js'
import {resolveCredentials} from '../lib/config.js'
import {type OutputFormat, renderLists} from '../lib/output.js'

export default class Lists extends Command {
  static description = 'List Bring shopping lists'
  static examples = [
    `<%= config.bin %> <%= command.id %>
Name       UUID    Theme
Groceries  list-1  ch.publisheria.bring.theme.home
`,
    `<%= config.bin %> <%= command.id %> --format json
[
  {
    "listUuid": "list-1",
    "name": "Groceries",
    "theme": "ch.publisheria.bring.theme.home"
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
    password: Flags.string({
      description: 'Bring account password. Defaults to BRING_PASSWORD.',
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Lists)
    const credentials = resolveCredentials(flags)
    const client = await createAuthenticatedClient(credentials)
    const {lists} = await client.loadLists()

    this.log(renderLists(lists, flags.format as OutputFormat))
  }
}
