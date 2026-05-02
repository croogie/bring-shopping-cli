import type {BringItems, BringList, ItemRow, ItemSection} from './types.js'

type ConcreteItemSection = Exclude<ItemSection, 'all'>

function normalizeSearchValue(value: string): string {
  return value.toLocaleLowerCase()
}

export function normalizeLocale(locale: string): string {
  const withoutEncoding = locale.split('.')[0]
  const [language, region] = withoutEncoding.replaceAll('_', '-').split('-')

  if (!region) return language

  return `${language.toLowerCase()}-${region.toUpperCase()}`
}

export function resolveDefaultLocale(): string {
  const dateTimeFormat = Intl.DateTimeFormat

  return normalizeLocale(dateTimeFormat().resolvedOptions().locale)
}

export function resolveList(lists: BringList[], list: string): BringList {
  const uuidMatch = lists.find((candidate) => candidate.listUuid === list)
  if (uuidMatch) return uuidMatch

  const normalizedListName = normalizeSearchValue(list)
  const nameMatches = lists.filter((candidate) => normalizeSearchValue(candidate.name) === normalizedListName)

  if (nameMatches.length === 0) {
    throw new Error(`Cannot find Bring list "${list}". Pass a list UUID or exact list name.`)
  }

  if (nameMatches.length > 1) {
    throw new Error(`Bring list name "${list}" matches multiple lists. Pass the list UUID instead.`)
  }

  return nameMatches[0]
}

export function flattenItems(
  items: BringItems,
  section: ItemSection,
  translations: Record<string, string> | undefined,
): ItemRow[] {
  const sections: ConcreteItemSection[] = section === 'all' ? ['purchase', 'recently'] : [section]

  return sections.flatMap((currentSection) =>
    items[currentSection].map((item) => {
      const translatedName = Object.entries(translations ?? {}).find(
        ([sourceName]) => normalizeSearchValue(sourceName) === normalizeSearchValue(item.name),
      )?.[1]

      return translatedName === undefined || translatedName === item.name
        ? {name: item.name, section: currentSection, specification: item.specification}
        : {name: translatedName, originalName: item.name, section: currentSection, specification: item.specification}
    }),
  )
}

export function translateItemName(
  name: string,
  translations: Record<string, string> | undefined,
): {
  name: string
  originalName?: string
} {
  const normalizedName = normalizeSearchValue(name)
  const sourceName = Object.entries(translations ?? {}).find(
    ([, translatedName]) => normalizeSearchValue(translatedName) === normalizedName,
  )?.[0]

  return sourceName === undefined || sourceName === name ? {name} : {name: sourceName, originalName: name}
}
