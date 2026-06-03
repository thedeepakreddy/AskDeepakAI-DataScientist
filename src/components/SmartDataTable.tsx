import React, { useState, useMemo } from 'react';
import { useDashboardContext } from './DashboardContext';
import { Search, Download, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

interface SmartDataTableProps {
  columns: string[];
}

export default function SmartDataTable({ columns }: SmartDataTableProps) {
  const { filteredData } = useDashboardContext();
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDesc, setSortDesc] = useState(false);
  const [page, setPage] = useState(0);

  const PAGE_SIZE = 10;

  const processedData = useMemo(() => {
    if (!filteredData) return [];
    let _data = [...filteredData];

    if (search) {
      const lowerSearch = search.toLowerCase();
      _data = _data.filter(row => 
        Object.values(row).some(v => String(v).toLowerCase().includes(lowerSearch))
      );
    }

    if (sortCol) {
      _data.sort((a, b) => {
        const aVal = a[sortCol];
        const bVal = b[sortCol];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDesc ? bVal - aVal : aVal - bVal;
        }
        return sortDesc 
          ? String(bVal).localeCompare(String(aVal))
          : String(aVal).localeCompare(String(bVal));
      });
    }

    return _data;
  }, [filteredData, search, sortCol, sortDesc]);

  const totalPages = Math.ceil(processedData.length / PAGE_SIZE);
  const paginatedData = processedData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDesc(!sortDesc);
    } else {
      setSortCol(col);
      setSortDesc(false);
    }
  };

  const exportCSV = () => {
    if (processedData.length === 0) return;
    const header = columns.join(',');
    const rows = processedData.map(row => 
      columns.map(c => `"${String(row[c] || '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `export_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col min-h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Data Browser</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Search data..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg pl-7 pr-3 py-1.5 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button onClick={exportCSV} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg transition-colors" title="Export CSV">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-slate-800 bg-slate-950 custom-scrollbar">
        <table className="w-full text-left border-collapse text-[10px] text-slate-300">
          <thead className="bg-slate-900 sticky top-0 z-10 shadow-sm shadow-slate-900">
            <tr>
              {columns.map(col => (
                <th key={col} className="p-2 font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors" onClick={() => handleSort(col)}>
                  <div className="flex items-center justify-between">
                    {col}
                    <ArrowUpDown className={`w-3 h-3 ${sortCol === col ? 'text-blue-400' : 'text-slate-600'}`} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/30 transition-colors border-b border-slate-800/50 last:border-0 pointer-events-none">
                {columns.map(col => (
                  <td key={col} className="p-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] pointer-events-auto" title={String(row[col] || '')}>
                    {row[col] !== null && row[col] !== undefined ? String(row[col]) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
         {paginatedData.length === 0 && (
          <div className="text-center p-8 text-slate-500 text-xs">No records found.</div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
        <div>Showing {page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, processedData.length)} of {processedData.length} records</div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1 bg-slate-800 rounded disabled:opacity-50 hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-1 bg-slate-800 rounded disabled:opacity-50 hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
