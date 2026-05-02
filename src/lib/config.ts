import type {BringCredentials, CredentialFlags} from './types.js'

export function resolveCredentials(flags: CredentialFlags, env: NodeJS.ProcessEnv = process.env): BringCredentials {
  const email = flags.email ?? env.BRING_EMAIL
  const password = flags.password ?? env.BRING_PASSWORD

  if (!email || !password) {
    throw new Error('Missing Bring credentials. Set BRING_EMAIL and BRING_PASSWORD or pass --email and --password.')
  }

  return {email, password}
}
