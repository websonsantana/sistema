interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
}

export function DataTable({ data, columns, loading }: DataTableProps) {
  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-8">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-8">
        <div className="text-center text-gray-500">
          <p>Nenhum registro encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {data.map((row, index) => (
              <tr key={row._id || index} className="hover:bg-gray-50/30 transition-colors">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
