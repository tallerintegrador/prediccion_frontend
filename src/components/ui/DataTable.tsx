import type { ReactNode } from 'react'

export type DataColumn<T> = {
  header: string
  render: (item: T) => ReactNode
  className?: string
}

type DataTableProps<T> = {
  columns: DataColumn<T>[]
  data: T[]
  emptyText?: string
}

export function DataTable<T>({ columns, data, emptyText = 'No hay datos disponibles.' }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            {columns.map((column) => (
              <th key={column.header} className={`px-4 py-3 font-semibold ${column.className ?? ''}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index} className="border-b border-slate-100 text-slate-900 last:border-0">
                {columns.map((column) => (
                  <td key={column.header} className={`px-4 py-4 ${column.className ?? ''}`}>
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
