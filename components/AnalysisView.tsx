import React, { useState, useEffect, useRef } from 'react';
import type { AnalysisResult } from '../types';
import { ClipboardIcon, ClipboardCheckIcon, RefreshCwIcon, PrinterIcon, UploadCloudIcon } from './Icons';
import MetadataView from './MetadataView';
import { config } from '../config';

interface AnalysisViewProps {
  result: AnalysisResult;
  onReset: () => void;
}

type Tab = 'rezumat' | 'raport' | 'diagnostice' | 'pasi' | 'reteta';

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState<Tab>('rezumat');
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [signature, setSignature] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string>('');
  const [patientCnp, setPatientCnp] = useState<string>('');
  const signatureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedSignature = localStorage.getItem('doctorSignature');
    if (savedSignature) {
      setSignature(savedSignature);
    }
  }, []);

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSignature(base64String);
        localStorage.setItem('doctorSignature', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    if (!signature) {
      if (!confirm("Atenție: Nu ați adăugat o semnătură. Doriți să printați oricum?")) {
        return;
      }
    }
    window.print();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [id]: true });
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [id]: false });
    }, 2000);
  };

  const getFullTextForCopy = (tab: Tab): string => {
    switch (tab) {
        case 'rezumat':
            return `Rezumat Consultație:\n\n${result.rezumat}`;
        case 'raport':
            return `Raport SOAP:\n\nSubiectiv:\n${result.raportSOAP.Subiectiv}\n\nObiectiv:\n${result.raportSOAP.Obiectiv}\n\nAnaliză:\n${result.raportSOAP.Analiza}\n\nPlan:\n${result.raportSOAP.Plan}`;
        case 'diagnostice':
            return `Diagnostice Posibile:\n\n- ${result.diagnosticePosibile.join('\n- ')}`;
        case 'pasi':
            return `Pași Următori Recomandați:\n\n- ${result.pasiUrmatori.join('\n- ')}`;
        case 'reteta':
            const patientInfo = `Pacient: ${patientName || 'Nespecificat'}\nCNP: ${patientCnp || 'Nespecificat'}\n`;
            return `Rețetă Medicală:\n\n${patientInfo}Medic: Dr. ${result.reteta.numeDoctor || 'Nespecificat'}\n\nMedicație:\n- ${result.reteta.medicatie.join('\n- ')}\n\nInstrucțiuni:\n${result.reteta.instructiuni}`;
        default:
            return '';
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'rezumat', label: 'Rezumat' },
    { id: 'raport', label: 'Raport SOAP' },
    { id: 'diagnostice', label: 'Diagnostice' },
    { id: 'pasi', label: 'Pași Următori' },
    { id: 'reteta', label: 'Rețetă' },
  ];

  const renderContent = () => {
    const id = activeTab;
    const isCopied = copiedStates[id];
    const hasPrescription = result.reteta && result.reteta.medicatie && result.reteta.medicatie.length > 0;
    
    return (
        <div className="relative p-1">
             <button
                onClick={() => handleCopy(getFullTextForCopy(id), id)}
                className="absolute top-2 right-2 p-2 rounded-lg bg-slate-100 dark:bg-gray-600 hover:bg-slate-200 dark:hover:bg-gray-500 transition-colors"
                aria-label="Copiază conținutul"
            >
                {isCopied ? <ClipboardCheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardIcon className="w-5 h-5" />}
            </button>
            {id === 'rezumat' && (
                <div>
                    <h3 className="text-xl font-bold mb-3 text-primary-700 dark:text-primary-400">Rezumat Consultație</h3>
                    <p className="whitespace-pre-wrap">{result.rezumat}</p>
                </div>
            )}
            {id === 'raport' && (
                 <div>
                    <h3 className="text-xl font-bold mb-3 text-primary-700 dark:text-primary-400">Raport Medical (SOAP)</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">S (Subiectiv)</h4>
                            <p className="pl-2 border-l-4 border-blue-300 dark:border-blue-700 ml-2 whitespace-pre-wrap">{result.raportSOAP.Subiectiv}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">O (Obiectiv)</h4>
                            <p className="pl-2 border-l-4 border-green-300 dark:border-green-700 ml-2 whitespace-pre-wrap">{result.raportSOAP.Obiectiv}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">A (Analiză)</h4>
                            <p className="pl-2 border-l-4 border-yellow-300 dark:border-yellow-600 ml-2 whitespace-pre-wrap">{result.raportSOAP.Analiza}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">P (Plan)</h4>
                            <p className="pl-2 border-l-4 border-purple-300 dark:border-purple-600 ml-2 whitespace-pre-wrap">{result.raportSOAP.Plan}</p>
                        </div>
                    </div>
                 </div>
            )}
            {id === 'diagnostice' && (
                <div>
                    <h3 className="text-xl font-bold mb-3 text-primary-700 dark:text-primary-400">Diagnostice Posibile</h3>
                    <ul className="list-disc list-inside space-y-2">
                        {result.diagnosticePosibile.map((diag, i) => <li key={i}>{diag}</li>)}
                    </ul>
                </div>
            )}
            {id === 'pasi' && (
                <div>
                    <h3 className="text-xl font-bold mb-3 text-primary-700 dark:text-primary-400">Pași Următori Recomandați</h3>
                    <ul className="list-disc list-inside space-y-2">
                        {result.pasiUrmatori.map((pas, i) => <li key={i}>{pas}</li>)}
                    </ul>
                </div>
            )}
            {id === 'reteta' && (
                <div>
                    <div id="printable-area">
                        <h3 className="text-2xl font-bold mb-6 text-center text-primary-700 dark:text-primary-400">Rețetă Medicală</h3>
                        {hasPrescription ? (
                            <div className="space-y-6 text-base">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 border-b pb-4">
                                    <p><strong>Pacient:</strong> {patientName || 'Nespecificat'}</p>
                                    <p><strong>CNP:</strong> {patientCnp || 'Nespecificat'}</p>
                                    {result.reteta.numeDoctor && <p className="col-span-2"><strong>Medic:</strong> Dr. {result.reteta.numeDoctor}</p>}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Medicație Prescrisă:</h4>
                                    {result.prescriptions && result.prescriptions.length > 0 ? (
                                        // Enhanced prescriptions from n8n
                                        <div className="space-y-4">
                                            {result.prescriptions.map((presc, i) => (
                                                <div key={i} className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-r">
                                                    <p className="font-semibold">{i + 1}. {presc.medicament} - {presc.doza}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Frecvență: {presc.frecventa} | Durată: {presc.duratie}
                                                    </p>
                                                    {presc.instructiuni && (
                                                        <p className="text-sm italic text-gray-500 dark:text-gray-400">
                                                            {presc.instructiuni}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        // Fallback to simple list
                                        <ul className="list-decimal list-inside pl-4 space-y-1">
                                            {result.reteta.medicatie.map((med, i) => <li key={i}>{med}</li>)}
                                        </ul>
                                    )}
                                </div>
                                {!result.prescriptions && (
                                    <div>
                                        <h4 className="font-semibold text-lg mb-2">Instrucțiuni:</h4>
                                        <p className="whitespace-pre-wrap pl-4">{result.reteta.instructiuni}</p>
                                    </div>
                                )}
                                <div className="pt-10 mt-10">
                                    <div className="flex justify-between items-end">
                                    <p><strong>Data:</strong> {new Date().toLocaleDateString('ro-RO')}</p>
                                    <div className="text-center">
                                        <p className="mb-2">Semnătură și Parafă Medic:</p>
                                        {signature ? (
                                        <img src={signature} alt="Semnătură doctor" className="h-20 max-w-xs border rounded bg-white p-1 object-contain" />
                                        ) : (
                                        <div className="h-20 w-48 border-b border-gray-400"></div>
                                        )}
                                    </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <p>Nu a fost identificată nicio rețetă în cadrul acestei consultații.</p>
                            </div>
                        )}
                    </div>
                     <div className="mt-8 pt-6 border-t dark:border-gray-700 no-print">
                        {hasPrescription && (
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nume Pacient</label>
                                    <input 
                                        type="text" 
                                        id="patientName" 
                                        value={patientName} 
                                        onChange={(e) => setPatientName(e.target.value)}
                                        placeholder="ex: Popescu Ion"
                                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="patientCnp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNP Pacient</label>
                                    <input 
                                        type="text" 
                                        id="patientCnp" 
                                        value={patientCnp} 
                                        onChange={(e) => setPatientCnp(e.target.value)}
                                        placeholder="ex: 1900101123456"
                                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-4">
                            <input type="file" accept="image/*" ref={signatureInputRef} onChange={handleSignatureUpload} className="hidden" />
                            <button onClick={() => signatureInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                <UploadCloudIcon className="w-4 h-4" />
                                {signature ? 'Schimbă Semnătura' : 'Încarcă Semnătura'}
                            </button>
                            <button onClick={handlePrint} disabled={!hasPrescription} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                                <PrinterIcon className="w-4 h-4" />
                                Printează / Exportă PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Analiză Consultație</h2>
            <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
                <RefreshCwIcon className="w-4 h-4" />
                Consultație Nouă
            </button>
        </div>

        {/* Medical Alerts from n8n */}
        {result.alerts && result.alerts.length > 0 && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Alerte Medicale</h3>
                        <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                            {result.alerts.map((alert, idx) => (
                                <li key={idx}>{alert}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        )}

        {/* Enhanced Metadata from n8n workflow */}
        {config.features.showQualityMetrics && result.metadata && (
            <MetadataView metadata={result.metadata} />
        )}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2">{renderContent()}</div>
    </div>
  );
};

export default AnalysisView;