import {runCommand} from '@oclif/test'
import {expect} from 'chai'

const originalFetch = Reflect.get(globalThis, 'fetch')

const lists = [
  {listUuid: 'list-1', name: 'Groceries', theme: 'ch.publisheria.bring.theme.home'},
  {listUuid: 'list-2', name: 'Bakery, "fresh"\nsection', theme: 'custom'},
]

function response(payload: unknown) {
  return {
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  }
}

function stubBringApi(responseLists = lists) {
  const calls: Array<{body?: unknown; url: string}> = []

  Reflect.set(globalThis, 'fetch', async (input: unknown, init?: {body?: unknown}) => {
    const url = String(input)
    calls.push({body: init?.body, url})

    if (url.endsWith('/bringauth')) {
      return response({
        'access_token': 'access-token',
        name: 'Bring User',
        'refresh_token': 'refresh-token',
        uuid: 'user-uuid',
      })
    }

    if (url.endsWith('/bringusers/user-uuid/lists')) {
      return response({lists: responseLists})
    }

    return response({error: true, message: `Unexpected URL: ${url}`})
  })

  return calls
}

describe('lists', () => {
  afterEach(() => {
    Reflect.set(globalThis, 'fetch', originalFetch)
    delete process.env.BRING_EMAIL
    delete process.env.BRING_PASSWORD
  })

  it('prints lists as text by default', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubBringApi()

    const {error, stdout} = await runCommand('lists')

    expect(error).to.equal(undefined)
    expect(stdout).to.contain('Name')
    expect(stdout).to.contain('UUID')
    expect(stdout).to.contain('Theme')
    expect(stdout).to.contain('Groceries')
    expect(stdout).to.contain('list-1')
  })

  it('prints lists as json', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubBringApi()

    const {error, stdout} = await runCommand('lists --format json')

    expect(error).to.equal(undefined)
    expect(JSON.parse(stdout)).to.deep.equal(lists)
  })

  it('prints lists as tsv', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubBringApi([lists[0]])

    const {error, stdout} = await runCommand('lists --format tsv')

    expect(error).to.equal(undefined)
    expect(stdout).to.equal('name\tlistUuid\ttheme\nGroceries\tlist-1\tch.publisheria.bring.theme.home\n')
  })

  it('prints lists as csv with escaped values', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    stubBringApi([lists[1]])

    const {error, stdout} = await runCommand('lists --format csv')

    expect(error).to.equal(undefined)
    expect(stdout).to.equal('name,listUuid,theme\n"Bakery, ""fresh""\nsection",list-2,custom\n')
  })

  it('fails with a helpful message when credentials are missing', async () => {
    const {error} = await runCommand('lists')

    expect(error?.message).to.contain('Missing Bring credentials')
    expect(error?.message).to.contain('BRING_EMAIL')
    expect(error?.message).to.contain('BRING_PASSWORD')
  })

  it('lets flags override environment credentials', async () => {
    process.env.BRING_EMAIL = 'env@example.com'
    process.env.BRING_PASSWORD = 'env-secret'
    const calls = stubBringApi()

    const {error} = await runCommand('lists --email flag@example.com --password flag-secret')

    expect(error).to.equal(undefined)
    expect(String(calls[0].body)).to.equal('email=flag%40example.com&password=flag-secret')
  })
})
