import {runCommand} from '@oclif/test'
import {expect} from 'chai'

const originalDateTimeFormat = Intl.DateTimeFormat
const originalFetch = Reflect.get(globalThis, 'fetch')

const lists = [
  {listUuid: 'list-1', name: 'Groceries', theme: 'ch.publisheria.bring.theme.home'},
  {listUuid: 'list-2', name: 'Groceries', theme: 'custom'},
  {listUuid: 'list-3', name: 'Hardware', theme: 'custom'},
]

function response(payload: unknown) {
  return {
    json: async () => payload,
    text: async () => (typeof payload === 'string' ? payload : JSON.stringify(payload)),
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
  const calls: Array<{body?: unknown; method?: string; url: string}> = []
  const responseLists = options.responseLists ?? lists
  const translations = options.translations ?? {Milk: 'Mleko'}

  Reflect.set(globalThis, 'fetch', async (input: unknown, init?: {body?: unknown; method?: string}) => {
    const url = String(input)
    calls.push({body: init?.body, method: init?.method, url})

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

    if (url.endsWith('/bringlists/list-1') && init?.method === 'PUT') {
      return response('')
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

describe('items done', () => {
  afterEach(() => {
    Reflect.set(globalThis, 'fetch', originalFetch)
    Reflect.set(Intl, 'DateTimeFormat', originalDateTimeFormat)
    delete process.env.BRING_EMAIL
    delete process.env.BRING_PASSWORD
  })

  it('marks a raw item as done by list uuid', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    const calls = stubBringApi()

    const {error, stdout} = await runCommand(['items done', 'list-1', 'Milk', '--no-translate'])

    expect(error).to.equal(undefined)
    expect(stdout).to.equal('Marked Milk as done in Groceries (list-1)\n')
    const putCall = calls.find((call) => call.method === 'PUT')
    expect(putCall?.body).to.equal('&purchase=&recently=Milk&specification=&remove=&&sender=null')
    expect(putCall?.url).to.equal('https://api.getbring.com/rest/v2/bringlists/list-1')
  })

  it('marks a reverse-translated item as done', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubDefaultLocale('pl_PL.UTF-8')
    const calls = stubBringApi()

    const {error, stdout} = await runCommand(['items done', 'list-1', 'mleko'])

    expect(error).to.equal(undefined)
    expect(stdout).to.equal('Marked mleko as done in Groceries (list-1); matched as: Milk\n')
    const putCall = calls.find((call) => call.method === 'PUT')
    expect(putCall?.body).to.equal('&purchase=&recently=Milk&specification=&remove=&&sender=null')
  })

  it('resolves list by case-insensitive exact name', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubBringApi({responseLists: [lists[0], lists[2]]})

    const {error, stdout} = await runCommand(['items done', 'groceries', 'Milk', '--no-translate'])

    expect(error).to.equal(undefined)
    expect(stdout).to.equal('Marked Milk as done in Groceries (list-1)\n')
  })

  it('passes explicit locale to loadTranslations', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    const calls = stubBringApi()

    const {error, stdout} = await runCommand(['items done', 'list-1', 'Milch', '--locale', 'de-DE'])

    expect(error).to.equal(undefined)
    expect(stdout).to.equal('Marked Milch as done in Groceries (list-1); matched as: Milk\n')
    expect(calls.map((call) => call.url)).to.include('https://web.getbring.com/locale/articles.de-DE.json')
  })

  it('skips translations when --no-translate is passed', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    const calls = stubBringApi()

    const {error, stdout} = await runCommand(['items done', 'list-1', 'Milk', '--no-translate'])

    expect(error).to.equal(undefined)
    expect(stdout).to.equal('Marked Milk as done in Groceries (list-1)\n')
    expect(calls.some((call) => call.url.includes('/locale/articles.'))).to.equal(false)
  })

  it('prints json output', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubDefaultLocale('pl-PL')
    stubBringApi()

    const {error, stdout} = await runCommand(['items done', 'list-1', 'Mleko', '--format', 'json'])

    expect(error).to.equal(undefined)
    expect(JSON.parse(stdout)).to.deep.equal({
      listName: 'Groceries',
      listUuid: 'list-1',
      name: 'Milk',
      originalName: 'Mleko',
    })
  })

  it('prints csv output', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubDefaultLocale('pl-PL')
    stubBringApi()

    const {error, stdout} = await runCommand(['items done', 'list-1', 'Mleko', '--format', 'csv'])

    expect(error).to.equal(undefined)
    expect(stdout).to.equal('listUuid,listName,name,originalName\nlist-1,Groceries,Milk,Mleko\n')
  })

  it('prints tsv output', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubDefaultLocale('pl-PL')
    stubBringApi()

    const {error, stdout} = await runCommand(['items done', 'list-1', 'Mleko', '--format', 'tsv'])

    expect(error).to.equal(undefined)
    expect(stdout).to.equal('listUuid\tlistName\tname\toriginalName\nlist-1\tGroceries\tMilk\tMleko\n')
  })

  it('fails when credentials are missing', async () => {
    const {error} = await runCommand(['items done', 'list-1', 'Milk'])

    expect(error?.message).to.contain('Missing Bring credentials')
  })

  it('fails for unknown lists', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubBringApi()

    const {error} = await runCommand(['items done', 'Missing', 'Milk', '--no-translate'])

    expect(error?.message).to.equal('Cannot find Bring list "Missing". Pass a list UUID or exact list name.')
  })

  it('fails for ambiguous list names', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubBringApi()

    const {error} = await runCommand(['items done', 'Groceries', 'Milk', '--no-translate'])

    expect(error?.message).to.equal('Bring list name "Groceries" matches multiple lists. Pass the list UUID instead.')
  })

  it('fails clearly when translations cannot be loaded', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubDefaultLocale('pl-PL')
    stubBringApi({translations: {error: true, message: 'missing locale'}})

    const {error} = await runCommand(['items done', 'list-1', 'Milk'])

    expect(error?.message).to.contain('Cannot load Bring translations for locale pl-PL')
    expect(error?.message).to.contain('--locale')
    expect(error?.message).to.contain('--no-translate')
  })
})
