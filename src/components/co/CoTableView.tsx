import { getCOTableRowSpan, isMergedCellValue } from "../../utils/coTableUtils";

interface Props {
  rows: any[];
}

const CoTableView = ({ rows }: Props) => {
  const renderCell = (row: any, rowIndex: number, field: string, className: string) => {
    if (isMergedCellValue(row[field])) return null;

    return (
      <td rowSpan={getCOTableRowSpan(rows, rowIndex, field)} className={className}>
        {row[field] ?? "—"}
      </td>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Elements</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-center">Hours</th>
              <th className="px-4 py-3 text-right">Cost ($)</th>
              <th className="px-4 py-3">Remarks</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {rows.map((r, i) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{i + 1}</td>

                {renderCell(r, i, "description", "px-4 py-3 max-w-xs")}
                {renderCell(r, i, "referenceDoc", "px-4 py-3")}
                {renderCell(r, i, "elements", "px-4 py-3")}
                {renderCell(r, i, "QtyNo", "px-4 py-3 text-center font-medium")}
                {renderCell(r, i, "hours", "px-4 py-3 text-center")}
                {isMergedCellValue(r.cost)
                  ? null
                  : <td rowSpan={getCOTableRowSpan(rows, i, "cost")} className="px-4 py-3 text-right font-semibold">${r.cost ?? 0}</td>}
                {renderCell(r, i, "remarks", "px-4 py-3 max-w-xs text-gray-700")}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoTableView;
