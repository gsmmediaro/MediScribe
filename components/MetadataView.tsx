import React from 'react';
import type { TranscriptionMetadata } from '../types';

interface MetadataViewProps {
  metadata: TranscriptionMetadata;
}

const MetadataView: React.FC<MetadataViewProps> = ({ metadata }) => {
  const getQualityColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getQualityBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConsultationTypeBadge = (type: string): string => {
    const badges: Record<string, string> = {
      'fragment': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'scurtă': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'medie': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'completă': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'detaliată': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return badges[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 mb-6 border border-blue-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Metrici de Calitate (n8n Enhanced)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quality Score */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Scor Calitate</span>
            <span className={`text-2xl font-bold ${getQualityColor(metadata.quality_score)}`}>
              {metadata.quality_score}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getQualityBgColor(metadata.quality_score)} transition-all duration-500`}
              style={{ width: `${metadata.quality_score}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-center text-gray-500 dark:text-gray-400">
            {metadata.quality_label}
          </div>
        </div>

        {/* Consultation Type */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tip Consultație</div>
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getConsultationTypeBadge(metadata.consultation_type)}`}>
              {metadata.consultation_type.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {metadata.completeness_percent}% complet
            </span>
          </div>
        </div>

        {/* Text Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Statistici Text</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metadata.word_count}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Cuvinte</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{metadata.sentence_count}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Propoziții</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metadata.speaker_count}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Vorbitori</div>
            </div>
          </div>
        </div>

        {/* Medical Terms */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Termeni Medicali ({metadata.medical_terms_count})
          </div>
          {metadata.medical_terms_found.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {metadata.medical_terms_found.slice(0, 5).map((term, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-xs rounded-full"
                >
                  {term}
                </span>
              ))}
              {metadata.medical_terms_found.length > 5 && (
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  +{metadata.medical_terms_found.length - 5} mai mult
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
              Nu s-au detectat termeni medicali
            </div>
          )}
        </div>
      </div>

      {/* Validation Status */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className={`px-3 py-2 rounded-lg text-center ${metadata.is_valid ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
          <div className="text-xs font-medium">
            {metadata.is_valid ? '✓ Transcriere Validă' : '✗ Transcriere Invalidă'}
          </div>
        </div>
        <div className={`px-3 py-2 rounded-lg text-center ${metadata.has_diarization ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
          <div className="text-xs font-medium">
            {metadata.has_diarization ? '✓ Diarizare Reală' : '○ Fără Diarizare'}
          </div>
        </div>
        <div className={`px-3 py-2 rounded-lg text-center ${metadata.has_medical_context ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
          <div className="text-xs font-medium">
            {metadata.has_medical_context ? '✓ Context Medical' : '○ Fără Context Medical'}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {metadata.warnings.length > 0 && (
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
            ⚠️ Avertizări:
          </div>
          <ul className="text-xs text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
            {metadata.warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Processing Info */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Procesat la: {new Date(metadata.processed_at).toLocaleString('ro-RO')}
      </div>
    </div>
  );
};

export default MetadataView;
