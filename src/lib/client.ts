import {createRequire} from 'node:module'

import type {BringCredentials} from './config.js'

export interface BringList {
  listUuid: string
  name: string
  theme: string
}

export interface BringClient {
  loadLists(): Promise<{lists: BringList[]}>
  login(): Promise<void>
}

type BringConstructor = new (options: {mail: string; password: string}) => BringClient

const require = createRequire(import.meta.url)
const Bring = require('bring-shopping') as BringConstructor

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function createAuthenticatedClient(credentials: BringCredentials): Promise<BringClient> {
  const client = new Bring({mail: credentials.email, password: credentials.password})

  try {
    await client.login()
  } catch (error) {
    throw new Error(`Cannot authenticate with Bring: ${errorMessage(error)}`)
  }

  return client
}
