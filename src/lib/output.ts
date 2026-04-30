import type {BringList} from './client.js'

export type OutputFormat = 'csv' | 'json' | 'text' | 'tsv'

const columns: Array<keyof BringList> = ['name', 'listUuid', 'theme']

function stringify(value: string | undefined): string {
  return value ?? ''
}

function escapeCsv(value: string): string {
  if (!/[",\n\r]/.test(value)) return value

  return `"${value.replaceAll('"', '""')}"`
}

function renderDelimited(lists: BringList[], delimiter: ',' | '\t'): string {
  const escape = delimiter === ',' ? escapeCsv : stringify
  const header = columns.join(delimiter)
  const rows = lists.map((list) => columns.map((column) => escape(stringify(list[column]))).join(delimiter))

  return [header, ...rows].join('\n')
}

function renderText(lists: BringList[]): string {
  const rows = [
    ['Name', 'UUID', 'Theme'],
    ...lists.map((list) => [stringify(list.name), stringify(list.listUuid), stringify(list.theme)]),
  ]
  const widths = rows[0].map((_, index) => Math.max(...rows.map((row) => row[index].length)))

  return rows.map((row) => row.map((cell, index) => cell.padEnd(widths[index])).join('  ').trimEnd()).join('\n')
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
