import React from "react";
import { CheckCircle, Plus } from "lucide-react";

interface WprScheduleTableProps {
  scheduleRows: any[];
  canEdit: boolean;
  activeCell: any;
  editValue: string;
  setEditValue: (val: string) => void;
  inputRef: React.RefObject<any>;
  onCellClick: (table: string, rowId: string, field: string, value: string) => void;
  onCellSave: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onAddRow: () => void;
}

const WprScheduleTable: React.FC<WprScheduleTableProps> = ({
  scheduleRows,
  canEdit,
  activeCell,
  editValue,
  setEditValue,
  inputRef,
  onCellClick,
  onCellSave,
  onKeyDown,
  onAddRow
}) => {

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-black w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-black">1. Project Schedule / Milestones</h3>
        </div>
        {canEdit && (
          <button
            onClick={onAddRow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-750 rounded-none text-xs font-bold uppercase transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Row
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-black rounded-none bg-white shadow-sm custom-scrollbar max-w-full">
        <table className="w-full text-left border-collapse min-w-[800px] text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-black">
              <th className="p-3 font-bold uppercase tracking-wider text-black border-r border-black/10 w-56">Phase / Subject</th>
              <th className="p-3 font-bold uppercase tracking-wider text-black border-r border-black/10 w-28">Start Date</th>
              <th className="p-3 font-bold uppercase tracking-wider text-black border-r border-black/10 min-w-[15rem]">IFA - Submission Date</th>
              <th className="p-3 font-bold uppercase tracking-wider text-black border-r border-black/10 min-w-[8rem]">BFA - Recd Date</th>
              <th className="p-3 font-bold uppercase tracking-wider text-black border-r border-black/10 min-w-[10rem]">IFC - Sub Date</th>
              <th className="p-3 font-bold uppercase tracking-wider text-black border-r border-black/10 min-w-[16rem]">COR Drawing Submission Date</th>
              <th className="p-3 font-bold uppercase tracking-wider text-black min-w-[16rem]">Comment</th>
            </tr>
          </thead>
          <tbody className="">
            {scheduleRows.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-black/10 transition-all ${row._type === "milestone"
                  ? "bg-[#f0f7ed] hover:bg-[#e6f3e2]"
                  : "bg-white hover:bg-slate-50"
                  }`}
              >
                {/* Phase / Subject */}
                <td
                  onClick={() => onCellClick("schedule", row.id, "phase", row.phase)}
                  className="p-3 font-bold border-r border-black/10 cursor-pointer hover:bg-slate-100/50 text-black"
                >
                  {activeCell?.table === "schedule" && activeCell.rowId === row.id && activeCell.field === "phase" ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={onCellSave}
                      onKeyDown={onKeyDown}
                      className="w-full bg-white border border-black px-2 py-1 rounded-none font-bold uppercase text-xs text-black"
                    />
                  ) : (
                    <span className="uppercase">{row.phase}</span>
                  )}
                </td>

                {/* Start Date */}
                <td
                  onClick={() => onCellClick("schedule", row.id, "startDate", row.startDate)}
                  className="p-3 border-r border-black/10 font-bold text-black cursor-pointer hover:bg-slate-100/50"
                >
                  {activeCell?.table === "schedule" && activeCell.rowId === row.id && activeCell.field === "startDate" ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={onCellSave}
                      onKeyDown={onKeyDown}
                      className="w-full bg-white border border-black px-2 py-1 rounded-none text-xs text-black"
                    />
                  ) : (
                    <span>{row.startDate}</span>
                  )}
                </td>

                {/* IFA submission date */}
                <td className="p-0 border-r border-black/10 align-top h-[1px]">
                  {activeCell?.table === "schedule" && activeCell.rowId === row.id && activeCell.field === "ifaSubDate" ? (
                    <div className="p-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={onCellSave}
                        onKeyDown={onKeyDown}
                        className="w-full bg-white border border-black px-2 py-1 rounded-none text-xs text-black"
                      />
                    </div>
                  ) : row.unifiedEntries && row.unifiedEntries.length > 0 ? (
                    <div className="grid h-full" style={{ gridTemplateRows: `repeat(${row.unifiedEntries.length}, minmax(0, 1fr))` }}>
                      {row.unifiedEntries.map((entry: any, i: number) => (
                        <div key={i} className="flex flex-col justify-center p-3">
                          {entry.ifaDate !== "—" ? (
                            <>
                              <span className="text-[11px] font-bold text-blue-800 leading-tight">
                                {entry.subject}
                              </span>
                              <span className="text-[11px] text-blue-600 font-semibold leading-tight mt-0.5">
                                {entry.stage && entry.stage.toUpperCase() !== "IFA" ? `${entry.stage.toUpperCase()} - ` : ""}{entry.ifaDate}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="block p-3 text-gray-400">—</span>
                  )}
                </td>

                {/* BFA date */}
                <td
                  onClick={() => onCellClick("schedule", row.id, "bfaRecdDate", row.bfaRecdDate)}
                  className="p-0 border-r border-black/10 align-top cursor-pointer hover:bg-slate-100/50 h-[1px]"
                >
                  {activeCell?.table === "schedule" && activeCell.rowId === row.id && activeCell.field === "bfaRecdDate" ? (
                    <div className="p-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={onCellSave}
                        onKeyDown={onKeyDown}
                        className="w-full bg-white border border-black px-2 py-1 rounded-none text-xs text-black"
                      />
                    </div>
                  ) : row.unifiedEntries && row.unifiedEntries.length > 0 ? (
                    <div className="grid h-full" style={{ gridTemplateRows: `repeat(${row.unifiedEntries.length}, minmax(0, 1fr))` }}>
                      {row.unifiedEntries.map((entry: any, i: number) => {
                        return (
                          <div key={i} className="flex flex-col justify-center p-3">
                            {entry.bfaDate !== "—" ? (
                              <>
                                <span className="text-[11px] font-bold text-blue-800 leading-tight">
                                  {entry.subject}
                                </span>
                                <span className="text-[11px] text-blue-600 font-semibold leading-tight mt-0.5">
                                  {entry.bfaDate}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="block p-3 text-gray-400">—</span>
                  )}
                </td>

                {/* IFC sub date */}
                <td className="p-0 border-r border-black/10 align-top h-[1px]">
                  {activeCell?.table === "schedule" && activeCell.rowId === row.id && activeCell.field === "ifcSubDate" ? (
                    <div className="p-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={onCellSave}
                        onKeyDown={onKeyDown}
                        className="w-full bg-white border border-black px-2 py-1 rounded-none text-xs text-black"
                      />
                    </div>
                  ) : row.unifiedEntries && row.unifiedEntries.length > 0 ? (
                    <div className="grid h-full" style={{ gridTemplateRows: `repeat(${row.unifiedEntries.length}, minmax(0, 1fr))` }}>
                      {row.unifiedEntries.map((entry: any, i: number) => (
                        <div key={i} className="flex flex-col justify-center p-3">
                          {entry.ifcDate !== "—" ? (
                            <>
                              <span className="text-[11px] font-bold text-blue-800 leading-tight">
                                {entry.subject}
                              </span>
                              <span className="text-[11px] text-blue-600 font-semibold leading-tight mt-0.5">
                                {entry.ifcDate}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="block p-3 text-gray-400">—</span>
                  )}
                </td>

                {/* COR Drawing Sub date */}
                <td className="p-0 border-r border-black/10 align-top h-[1px]">
                  {activeCell?.table === "schedule" && activeCell.rowId === row.id && activeCell.field === "corSubDate" ? (
                    <div className="p-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={onCellSave}
                        onKeyDown={onKeyDown}
                        className="w-full bg-white border border-black px-2 py-1 rounded-none text-xs text-black"
                      />
                    </div>
                  ) : row.unifiedEntries && row.unifiedEntries.length > 0 ? (
                    <div className="grid h-full" style={{ gridTemplateRows: `repeat(${row.unifiedEntries.length}, minmax(0, 1fr))` }}>
                      {row.unifiedEntries.map((entry: any, i: number) => (
                        <div key={i} className="flex flex-col justify-center p-3">
                          {entry.corDate !== "—" ? (
                            <>
                              <span className="text-[11px] font-bold text-blue-800 leading-tight">
                                {entry.subject}
                              </span>
                              <span className="text-[11px] text-blue-600 font-semibold leading-tight mt-0.5">
                                {entry.corDate}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="block p-3 text-gray-400">—</span>
                  )}
                </td>

                {/* Submittal Status (Comment) */}
                <td className="p-0 align-top h-[1px]">
                  {(() => {
                    if (row.unifiedEntries && row.unifiedEntries.length > 0) {
                      return (
                        <div className="grid h-full" style={{ gridTemplateRows: `repeat(${row.unifiedEntries.length}, minmax(0, 1fr))` }}>
                          {row.unifiedEntries.map((entry: any, i: number) => {
                            return (
                              <div key={i} className="flex flex-col justify-center p-3">
                                <div className="text-[11px] text-gray-700 font-normal break-words">
                                  {entry.notes && typeof entry.notes === "string" && entry.notes.trim() !== "" ? entry.notes : "—"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }

                    if (row.comments && row.comments !== "—" && typeof row.comments === "string") {
                      return (
                        <div className="p-3 text-[11px] text-gray-700 break-words font-normal">
                          {row.comments}
                        </div>
                      );
                    }
                    return <span className="block p-3 text-gray-400">—</span>;
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WprScheduleTable;
