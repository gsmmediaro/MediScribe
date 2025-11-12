// @/hooks/usePatientHistory.ts

import { useState, useEffect } from 'react';
import type { AnalysisResult } from '../types';

export interface PatientRecord {
  id: string;
  patientName: string;
  patientCnp?: string;
  timestamp: string;
  date: string;
  time: string;
  analysis: AnalysisResult;
  transcription: string;
}

const STORAGE_KEY = 'mediscribe_patient_history';
const MAX_RECORDS = 100; // Keep last 100 consultations

export const usePatientHistory = () => {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load records from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecords(parsed);
      }
    } catch (error) {
      console.error('Error loading patient history:', error);
    }
  }, []);

  // Save record to localStorage
  const saveRecord = (
    patientName: string,
    patientCnp: string | undefined,
    analysis: AnalysisResult,
    transcription: string
  ) => {
    const now = new Date();
    const newRecord: PatientRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientName,
      patientCnp,
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('ro-RO'),
      time: now.toLocaleTimeString('ro-RO'),
      analysis,
      transcription,
    };

    const updatedRecords = [newRecord, ...records].slice(0, MAX_RECORDS);

    setRecords(updatedRecords);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Error saving patient record:', error);
    }

    return newRecord;
  };

  // Delete a record
  const deleteRecord = (id: string) => {
    const updatedRecords = records.filter(r => r.id !== id);
    setRecords(updatedRecords);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  // Clear all records
  const clearAllRecords = () => {
    setRecords([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing records:', error);
    }
  };

  // Export records as JSON
  const exportRecords = () => {
    const dataStr = JSON.stringify(records, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mediscribe-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter records based on search query
  const filteredRecords = searchQuery.trim()
    ? records.filter(record => {
        const query = searchQuery.toLowerCase();
        return (
          record.patientName.toLowerCase().includes(query) ||
          record.patientCnp?.includes(query) ||
          record.date.includes(query) ||
          record.analysis.rezumat.toLowerCase().includes(query) ||
          record.analysis.raportSOAP.Subiectiv.toLowerCase().includes(query) ||
          record.analysis.diagnosticePosibile.some(d => d.toLowerCase().includes(query))
        );
      })
    : records;

  return {
    records: filteredRecords,
    allRecords: records,
    searchQuery,
    setSearchQuery,
    saveRecord,
    deleteRecord,
    clearAllRecords,
    exportRecords,
  };
};
