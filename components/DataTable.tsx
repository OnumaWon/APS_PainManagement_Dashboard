import React from 'react';
import { CaseData } from '../types';
import { X } from 'lucide-react';

interface DataTableProps {
  data: CaseData[];
  filterCriteria: { field: string; value: any } | null;
  onClearFilter: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({ data, filterCriteria, onClearFilter }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[600px] mt-6 transition-colors" id="details-table">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <div>
           <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
             Detailed Case Records
             {filterCriteria && <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(Filtered View)</span>}
           </h3>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{data.length} records found</p>
        </div>
        {filterCriteria && (
            <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-medium animate-in fade-in slide-in-from-right-4 duration-300">
                <span>Filtered by {filterCriteria.field}: <strong>{String(filterCriteria.value)}</strong></span>
                <button onClick={onClearFilter} className="hover:text-blue-900 dark:hover:text-blue-100 p-0.5 bg-blue-200 dark:bg-blue-800 rounded-full"><X size={12}/></button>
            </div>
        )}
      </div>
      
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            No records match the current filters.
        </div>
      ) : (
        <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400 relative">
            <thead className="text-xs text-slate-700 dark:text-slate-200 uppercase bg-slate-50 dark:bg-slate-700/50 sticky top-0 z-10 shadow-sm">
                <tr>
                <th className="px-6 py-3 font-semibold">ID</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Patient</th>
                <th className="px-6 py-3 font-semibold">Specialty</th>
                <th className="px-6 py-3 font-semibold">Operation</th>
                <th className="px-6 py-3 font-semibold">Trauma Type</th>
                <th className="px-6 py-3 font-semibold">Pain Mgmt</th>
                <th className="px-6 py-3 font-semibold text-center">Pain (0-24h)</th>
                <th className="px-6 py-3 font-semibold text-center">Discharge</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">{row.id}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{row.patientGender}, {row.patientAge}</div>
                        <div className="text-xs text-slate-400">{row.nationality}</div>
                    </td>
                    <td className="px-6 py-3 text-slate-900 dark:text-slate-100">{row.specialty}</td>
                    <td className="px-6 py-3 max-w-[200px] truncate" title={row.operationType}>
                         {row.operationType}
                         <div className="text-xs text-slate-400">{row.orthoType}</div>
                    </td>
                    <td className="px-6 py-3">{row.traumaType}</td>
                    <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            {row.postOpPainMgmt}
                        </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                         <div className={`font-bold ${row.painScores.rest.h0_24 >= 7 ? 'text-red-500 dark:text-red-400' : row.painScores.rest.h0_24 >= 4 ? 'text-amber-500 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                             {row.painScores.rest.h0_24.toFixed(1)}
                         </div>
                    </td>
                    <td className="px-6 py-3 text-center text-slate-700 dark:text-slate-300 font-medium">
                        {row.painScoreDischarge?.toFixed(1) || '-'}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}
    </div>
  );
};