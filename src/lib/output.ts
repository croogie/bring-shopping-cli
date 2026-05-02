import type {AddedItemRow, BringList, ItemRow, OutputFormat} from './types.js'

const columns: Array<keyof BringList> = ['name', 'listUuid', 'theme']
const itemColumns: Array<keyof ItemRow> = ['section', 'name', 'originalName', 'specification']
const addedItemColumns: Array<keyof AddedItemRow> = ['listUuid', 'listName', 'name', 'originalName', 'specification']

function stringify(value: string | undefined): string {
  return value ?? ''
}

function escapeCsv(value: string): string {
  if (!/[",\n\r]/.test(value)) return value

  return `"${value.replaceAll('"', '""')}"`
}

function renderDelimitedRows<T extends object>(rows: T[], rowColumns: Array<keyof T>, delimiter: ',' | '\t'): string {
  const escape = delimiter === ',' ? escapeCsv : stringify
  const header = rowColumns.join(delimiter)
  const renderedRows = rows.map((row) =>
    rowColumns.map((column) => escape(stringify(row[column] as string | undefined))).join(delimiter),
  )

  return [header, ...renderedRows].join('\n')
}

function renderDelimited(lists: BringList[], delimiter: ',' | '\t'): string {
  return renderDelimitedRows(lists, columns, delimiter)
}

function renderText(lists: BringList[]): string {
  const rows = [
    ['Name', 'UUID', 'Theme'],
    ...lists.map((list) => [stringify(list.name), stringify(list.listUuid), stringify(list.theme)]),
  ]
  const widths = rows[0].map((_, index) => Math.max(...rows.map((row) => row[index].length)))

  return rows
    .map((row) =>
      row
        .map((cell, index) => cell.padEnd(widths[index]))
        .join('  ')
        .trimEnd(),
    )
    .join('\n')
}

function renderItemsText(items: ItemRow[]): string {
  const hasTranslations = items.some((item) => item.originalName)
  const rows = [
    hasTranslations ? ['Section', 'Name', 'Original', 'Specification'] : ['Section', 'Name', 'Specification'],
    ...items.map((item) =>
      hasTranslations
        ? [item.section, item.name, stringify(item.originalName), item.specification]
        : [item.section, item.name, item.specification],
    ),
  ]
  const widths = rows[0].map((_, index) => Math.max(...rows.map((row) => row[index].length)))

  return rows
    .map((row) =>
      row
        .map((cell, index) => cell.padEnd(widths[index]))
        .join('  ')
        .trimEnd(),
    )
    .join('\n')
}

function renderAddedItemText(item: AddedItemRow): string {
  const displayName = item.originalName ?? item.name
  const parts = [`Added ${displayName} to ${item.listName} (${item.listUuid})`]

  if (item.originalName) {
    parts.push(`saved as: ${item.name}`)
  }

  if (item.specification) {
    parts.push(`specification: ${item.specification}`)
  }

  return [parts[0], ...parts.slice(1)].join('; ')
}

export function renderLists(lists: BringList[], format: OutputFormat): string {
  switch (format) {
    case 'csv': {
      return renderDelimited(lists, ',')
    }

    case 'json': {
      return JSON.stringify(lists, null, 2)
    }

    case 'text': {
      return renderText(lists)
    }

    case 'tsv': {
      return renderDelimited(lists, '\t')
    }
  }
}

export function renderItems(items: ItemRow[], format: OutputFormat): string {
  switch (format) {
    case 'csv': {
      return renderDelimitedRows(items, itemColumns, ',')
    }

    case 'json': {
      return JSON.stringify(items, null, 2)
    }

    case 'text': {
      return renderItemsText(items)
    }

    case 'tsv': {
      return renderDelimitedRows(items, itemColumns, '\t')
    }
  }
}

export function renderAddedItem(item: AddedItemRow, format: OutputFormat): string {
  switch (format) {
    case 'csv': {
      return renderDelimitedRows([item], addedItemColumns, ',')
    }

    case 'json': {
      return JSON.stringify(item, null, 2)
    }

    case 'text': {
      return renderAddedItemText(item)
    }

    case 'tsv': {
      return renderDelimitedRows([item], addedItemColumns, '\t')
    }
  }
}
