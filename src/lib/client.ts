import {createRequire} from 'node:module'

import type {BringClient, BringCredentials} from './types.js'

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
