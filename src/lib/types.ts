export interface BringCredentials {
  email: string
  password: string
}

export interface CredentialFlags {
  email?: string
  password?: string
}

export interface BringList {
  listUuid: string
  name: string
  theme: string
}

export interface BringItem {
  name: string
  specification: string
}

export interface BringItems {
  purchase: BringItem[]
  recently: BringItem[]
}

export interface BringClient {
  getItems(listUuid: string): Promise<BringItems>
  loadLists(): Promise<{lists: BringList[]}>
  loadTranslations(locale: string): Promise<Record<string, string>>
  login(): Promise<void>
}

export type OutputFormat = 'csv' | 'json' | 'text' | 'tsv'

export interface ItemRow {
  name: string
  originalName?: string
  section: 'purchase' | 'recently'
  specification: string
}

export type ItemSection = 'all' | 'purchase' | 'recently'
