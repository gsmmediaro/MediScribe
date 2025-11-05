// @/components/PatientHistory.tsx

import React from 'react';
import type { PatientRecord } from '../hooks/usePatientHistory';
import { SearchIcon, TrashIcon, DownloadIcon, CloseIcon } from './Icons';

interface PatientHistoryProps {
  records: PatientRecord[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectRecord: (record: PatientRecord) => void;
  onDeleteRecord: (id: string) => void;
  onExport: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

const PatientHistory: React.FC<PatientHistoryProps> = ({
  records,
  searchQuery,
  onSearchChange,
  onSelectRecord,
  onDeleteRecord,
  onExport,
  onClearAll,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📋 Istoric Pacienți
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Închide"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Actions */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Caută după nume, CNP, diagnostic..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={onExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              title="Exportă toate înregistrările"
            >
              <DownloadIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Exportă</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <p>
              {records.length} {records.length === 1 ? 'înregistrare' : 'înregistrări'}
            </p>
            {records.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Sigur doriți să ștergeți tot istoricul?')) {
                    onClearAll();
                  }
                }}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Șterge tot
              </button>
            )}
          </div>
        </div>

        {/* Records List */}
        <div className="flex-1 overflow-y-auto p-6">
          {records.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <p className="text-lg font-medium">
                {searchQuery ? 'Nicio înregistrare găsită' : 'Nu există consultații salvate'}
              </p>
              <p className="text-sm mt-2">
                {searchQuery ? 'Încercați un alt termen de căutare' : 'Consultațiile procesate vor apărea aici'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onSelectRecord(record)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {record.patientName}
                        </h3>
                        {record.patientCnp && (
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                            CNP: {record.patientCnp}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        📅 {record.date} • 🕐 {record.time}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {record.analysis.rezumat}
                      </p>
                      {record.analysis.diagnosticePosibile.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {record.analysis.diagnosticePosibile.slice(0, 3).map((diag, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                            >
                              {diag}
                            </span>
                          ))}
                          {record.analysis.diagnosticePosibile.length > 3 && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              +{record.analysis.diagnosticePosibile.length - 3} mai multe
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Ștergeți consultația pentru ${record.patientName}?`)) {
                          onDeleteRecord(record.id);
                        }
                      }}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Șterge"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;
