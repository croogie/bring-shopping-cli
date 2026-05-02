import {runCommand} from '@oclif/test'
import {expect} from 'chai'

const originalDateTimeFormat = Intl.DateTimeFormat
const originalFetch = Reflect.get(globalThis, 'fetch')

const lists = [
  {listUuid: 'list-1', name: 'Groceries', theme: 'ch.publisheria.bring.theme.home'},
  {listUuid: 'list-2', name: 'Groceries', theme: 'custom'},
  {listUuid: 'list-3', name: 'Hardware', theme: 'custom'},
]

const items = {
  purchase: [
    {name: 'Milk', specification: '2 liters'},
    {name: 'Bread', specification: ''},
  ],
  recently: [{name: 'Eggs', specification: '10'}],
  status: 'shared',
  uuid: 'list-1',
}

function response(payload: unknown) {
  return {
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  }
}

function stubDefaultLocale(locale: string) {
  Reflect.set(Intl, 'DateTimeFormat', () => ({
    resolvedOptions: () => ({locale}),
  }))
}

function stubBringApi(
  options: {responseLists?: typeof lists; translations?: Record<string, string> | {error: true; message: string}} = {},
) {
  const calls: Array<{body?: unknown; url: string}> = []
  const responseLists = options.responseLists ?? lists
  const translations = options.translations ?? {Milk: 'Mleko'}

  Reflect.set(globalThis, 'fetch', async (input: unknown, init?: {body?: unknown}) => {
    const url = String(input)
    calls.push({body: init?.body, url})

    if (url.endsWith('/bringauth')) {
      return response(
        Object.fromEntries([
          ['access_token', 'access-token'],
          ['name', 'Bring User'],
          ['refresh_token', 'refresh-token'],
          ['uuid', 'user-uuid'],
        ]),
      )
    }

    if (url.endsWith('/bringusers/user-uuid/lists')) {
      return response({lists: responseLists})
    }

    if (url.endsWith('/bringlists/list-1')) {
      return response(items)
    }

    if (url === 'https://web.getbring.com/locale/articles.pl-PL.json') {
      return response(translations)
    }

    if (url === 'https://web.getbring.com/locale/articles.de-DE.json') {
      return response({Milk: 'Milch'})
    }

    return response({error: true, message: `Unexpected URL: ${url}`})
  })

  return calls
}

describe('items', () => {
  afterEach(() => {
    Reflect.set(globalThis, 'fetch', originalFetch)
    Reflect.set(Intl, 'DateTimeFormat', originalDateTimeFormat)
    delete process.env.BRING_EMAIL
    delete process.env.BRING_PASSWORD
  })

  it('prints all items as text with translated names by default', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubDefaultLocale('pl_PL.UTF-8')
    stubBringApi()

    const {error, stdout} = await runCommand(['items', 'list-1'])

    expect(error).to.equal(undefined)
    expect(stdout).to.contain('Section')
    expect(stdout).to.contain('Name')
    expect(stdout).to.contain('Original')
    expect(stdout).to.contain('Specification')
    expect(stdout).to.contain('purchase')
    expect(stdout).to.contain('Mleko')
    expect(stdout).to.contain('Milk')
    expect(stdout).to.contain('recently')
    expect(stdout).to.contain('Eggs')
  })

  it('passes explicit locale to loadTranslations', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    const calls = stubBringApi()

    const {error, stdout} = await runCommand(['items', 'list-1', '--locale', 'de-DE'])

    expect(error).to.equal(undefined)
    expect(stdout).to.contain('Milch')
    expect(calls.map((call) => call.url)).to.include('https://web.getbring.com/locale/articles.de-DE.json')
  })

  it('skips translations when --no-translate is passed', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    const calls = stubBringApi()

    const {error, stdout} = await runCommand(['items', 'list-1', '--no-translate'])

    expect(error).to.equal(undefined)
    expect(stdout).to.contain('Milk')
    expect(stdout).not.to.contain('Mleko')
    expect(stdout).not.to.contain('Original')
    expect(calls.some((call) => call.url.includes('/locale/articles.'))).to.equal(false)
  })

  it('prints items as json', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubDefaultLocale('pl-PL')
    stubBringApi()

    const {error, stdout} = await runCommand(['items', 'list-1', '--format', 'json'])

    expect(error).to.equal(undefined)
    expect(JSON.parse(stdout)).to.deep.equal([
      {name: 'Mleko', originalName: 'Milk', section: 'purchase', specification: '2 liters'},
      {name: 'Bread', section: 'purchase', specification: ''},
      {name: 'Eggs', section: 'recently', specification: '10'},
    ])
  })

  it('prints items as csv', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubDefaultLocale('pl-PL')
    stubBringApi()

    const {error, stdout} = await runCommand(['items', 'list-1', '--format', 'csv'])

    expect(error).to.equal(undefined)
    expect(stdout).to.equal(
      'section,name,originalName,specification\npurchase,Mleko,Milk,2 liters\npurchase,Bread,,\nrecently,Eggs,,10\n',
    )
  })

  it('prints items as tsv', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubDefaultLocale('pl-PL')
    stubBringApi()

    const {error, stdout} = await runCommand(['items', 'list-1', '--format', 'tsv'])

    expect(error).to.equal(undefined)
    expect(stdout).to.equal(
      'section\tname\toriginalName\tspecification\npurchase\tMleko\tMilk\t2 liters\npurchase\tBread\t\t\nrecently\tEggs\t\t10\n',
    )
  })

  it('filters purchase items', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubBringApi()

    const {error, stdout} = await runCommand(['items', 'list-1', '--section', 'purchase', '--no-translate'])

    expect(error).to.equal(undefined)
    expect(stdout).to.contain('Milk')
    expect(stdout).not.to.contain('Eggs')
    expect(stdout).not.to.contain('recently')
  })

  it('filters recently items', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubBringApi()

    const {error, stdout} = await runCommand(['items', 'list-1', '--section', 'recently', '--no-translate'])

    expect(error).to.equal(undefined)
    expect(stdout).to.contain('Eggs')
    expect(stdout).not.to.contain('Milk')
    expect(stdout).not.to.contain('purchase')
  })

  it('resolves list by exact name', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubBringApi({responseLists: [lists[0], lists[2]]})

    const {error, stdout} = await runCommand(['items', 'Groceries', '--no-translate'])

    expect(error).to.equal(undefined)
    expect(stdout).to.contain('Milk')
  })

  it('fails when credentials are missing', async () => {
    const {error} = await runCommand(['items', 'list-1'])

    expect(error?.message).to.contain('Missing Bring credentials')
    expect(error?.message).to.contain('BRING_EMAIL')
    expect(error?.message).to.contain('BRING_PASSWORD')
  })

  it('fails for unknown lists', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubBringApi()

    const {error} = await runCommand(['items', 'Missing', '--no-translate'])

    expect(error?.message).to.equal('Cannot find Bring list "Missing". Pass a list UUID or exact list name.')
  })

  it('fails for ambiguous list names', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubBringApi()

    const {error} = await runCommand(['items', 'Groceries', '--no-translate'])

    expect(error?.message).to.equal('Bring list name "Groceries" matches multiple lists. Pass the list UUID instead.')
  })

  it('fails clearly when translations cannot be loaded', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubDefaultLocale('pl-PL')
    stubBringApi({translations: {error: true, message: 'missing locale'}})

    const {error} = await runCommand(['items', 'list-1'])

    expect(error?.message).to.contain('Cannot load Bring translations for locale pl-PL')
    expect(error?.message).to.contain('--locale')
    expect(error?.message).to.contain('--no-translate')
  })
})
