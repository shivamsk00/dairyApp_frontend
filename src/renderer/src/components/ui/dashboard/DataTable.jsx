/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import cx from '../utils/cx'
import '../ui.css'

/**
 * Lightweight, styled table for dashboard cards (top items, recent entries…). For sorting,
 * pagination or large data sets keep using @tanstack/react-table / react-data-table-component,
 * which the app already ships.
 *
 * @param {Array<{key: string, header: React.ReactNode, render?: (row) => React.ReactNode,
 *   className?: string}>} columns Without `render`, the cell shows row[key].
 * @param {Array<object>} rows
 * @param {(row, index: number) => string | number} [rowKey] Defaults to row.id, then the index.
 * @param {React.ReactNode} [emptyMessage='No records']
 * @param {string} [minWidth] e.g. '760px' to scroll horizontally on narrow screens.
 */
const DataTable = ({
  columns,
  rows = [],
  rowKey,
  emptyMessage = 'No records',
  minWidth,
  className
}) => (
  <div className={cx('ui-scroll-thin -mx-1 overflow-x-auto', className)}>
    <table className="ui-data-table w-full" style={minWidth ? { minWidth } : undefined}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col" className={column.className}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="ui-text-tertiary !py-8 text-center">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row, index) => (
            <tr key={rowKey ? rowKey(row, index) : (row.id ?? index)}>
              {columns.map((column) => (
                <td key={column.key} className={column.className}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)

export default DataTable
