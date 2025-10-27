// @/components/AnalysisView.tsx

import React, { useState, useEffect, useRef } from 'react';
import type { AnalysisResult, SoapReport, Reteta } from '../types'; // Am importat și Reteta
import { ClipboardIcon, ClipboardCheckIcon, RefreshCwIcon, PrinterIcon, UploadCloudIcon, SaveIcon } from './Icons';

interface AnalysisViewProps {
  result: AnalysisResult & { patientName?: string; patientCnp?: string; };
  onReset: () => void;
}

type Tab = 'rezumat' | 'raport' | 'diagnostice' | 'pasi' | 'reteta';

// Am actualizat tipul pentru a reflecta ce e editabil
type EditableResult = {
  rezumat: string;
  raportSOAP: SoapReport;
  diagnosticePosibile: string[]; // Rămâne needitabil (listă)
  pasiUrmatori: string[];      // Rămâne needitabil (listă)
  reteta: {                   // Facem instrucțiunile editabile
    medicatie: string[];     // Rămâne needitabil (listă)
    instructiuni: string;    // Editabil
    numeDoctor?: string;     // Rămâne needitabil momentan
  }
};

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState<Tab>('rezumat');
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [signature, setSignature] = useState<string | null>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // Inițializare sigură a stării editabile, inclusiv reteta.instructiuni
  const [editableResult, setEditableResult] = useState<EditableResult>(() => ({
    rezumat: result.rezumat || '',
    raportSOAP: {
      Subiectiv: result.raportSOAP?.Subiectiv || '',
      Obiectiv: result.raportSOAP?.Obiectiv || '',
      Analiza: result.raportSOAP?.Analiza || '',
      Plan: result.raportSOAP?.Plan || '',
    },
    diagnosticePosibile: Array.isArray(result.diagnosticePosibile) ? [...result.diagnosticePosibile] : [],
    pasiUrmatori: Array.isArray(result.pasiUrmatori) ? [...result.pasiUrmatori] : [],
    reteta: {
      medicatie: Array.isArray(result.reteta?.medicatie) ? [...result.reteta.medicatie] : [],
      instructiuni: result.reteta?.instructiuni || '', // Inițializăm
      numeDoctor: result.reteta?.numeDoctor || '',
    }
  }));

  // Funcție actualizată pentru a gestiona și reteta.instructiuni
  const handleInputChange = (
    field: keyof EditableResult | `raportSOAP.${keyof SoapReport}` | 'reteta.instructiuni',
    value: string
  ) => {
    setEditableResult(prev => {
      if (field === 'rezumat') {
        return { ...prev, rezumat: value };
      }
      if (field.startsWith('raportSOAP.')) {
        const soapField = field.split('.')[1] as keyof SoapReport;
        return {
          ...prev,
          raportSOAP: {
            ...prev.raportSOAP,
            [soapField]: value
          }
        };
      }
      // Adăugăm cazul pentru instrucțiunile rețetei
      if (field === 'reteta.instructiuni') {
          return {
              ...prev,
              reteta: {
                  ...prev.reteta,
                  instructiuni: value
              }
          };
      }
      return prev;
    });
  };

  // Actualizare sigură când props-urile se schimbă
  useEffect(() => {
    const savedSignature = localStorage.getItem('doctorSignature');
    if (savedSignature) {
      setSignature(savedSignature);
    }
    setEditableResult({
      rezumat: result.rezumat || '',
      raportSOAP: {
        Subiectiv: result.raportSOAP?.Subiectiv || '',
        Obiectiv: result.raportSOAP?.Obiectiv || '',
        Analiza: result.raportSOAP?.Analiza || '',
        Plan: result.raportSOAP?.Plan || '',
      },
      diagnosticePosibile: Array.isArray(result.diagnosticePosibile) ? [...result.diagnosticePosibile] : [],
      pasiUrmatori: Array.isArray(result.pasiUrmatori) ? [...result.pasiUrmatori] : [],
      reteta: {
        medicatie: Array.isArray(result.reteta?.medicatie) ? [...result.reteta.medicatie] : [],
        instructiuni: result.reteta?.instructiuni || '', // Actualizăm și aici
        numeDoctor: result.reteta?.numeDoctor || '',
      }
    });
  }, [result]);

  const hasPrescription = result.reteta && Array.isArray(result.reteta.medicatie) && result.reteta.medicatie.length > 0;

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // ... funcția rămâne la fel ...
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
    // ... funcția rămâne la fel ...
        if (!signature && hasPrescription) {
      if (!confirm("Atenție: Nu ați adăugat o semnătură pentru rețetă. Doriți să printați oricum?")) {
        return;
      }
    }
    window.print();
  };

  const handleCopy = (text: string, id: string) => {
    // ... funcția rămâne la fel ...
        navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [id]: true });
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [id]: false });
    }, 2000);
  };

  // Actualizăm pentru a folosi instrucțiunile editate
  const getFullTextForCopy = (tab: Tab): string => {
    const diagnosticeText = (result.diagnosticePosibile || []).join('\n- ');
    const pasiText = (result.pasiUrmatori || []).join('\n- ');
    const medicatieText = (result.reteta?.medicatie || []).join('\n- ');

    switch (tab) {
        case 'rezumat':
            return `Rezumat Consultație:\n\n${editableResult.rezumat}`;
        case 'raport':
            return `Raport SOAP:\n\nSubiectiv:\n${editableResult.raportSOAP.Subiectiv}\n\nObiectiv:\n${editableResult.raportSOAP.Obiectiv}\n\nAnaliză:\n${editableResult.raportSOAP.Analiza}\n\nPlan:\n${editableResult.raportSOAP.Plan}`;
        case 'diagnostice':
            return `Diagnostice Posibile:\n\n- ${diagnosticeText}`;
        case 'pasi':
            return `Pași Următori Recomandați:\n\n- ${pasiText}`;
        case 'reteta':
            const patientInfo = `Pacient: ${result.patientName || 'Nespecificat'}\nCNP: ${result.patientCnp || 'Nespecificat'}\n`;
            // Folosim instrucțiunile din starea editabilă
            return `Rețetă Medicală:\n\n${patientInfo}Medic: Dr. ${result.reteta?.numeDoctor || 'Nespecificat'}\n\nMedicație:\n- ${medicatieText}\n\nInstrucțiuni:\n${editableResult.reteta.instructiuni}`;
        default:
            return '';
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    // ... array-ul rămâne la fel ...
        { id: 'rezumat', label: 'Rezumat' },
    { id: 'raport', label: 'Raport SOAP' },
    { id: 'diagnostice', label: 'Diagnostice' },
    { id: 'pasi', label: 'Pași Următori' },
    { id: 'reteta', label: 'Rețetă' },
  ];

  // Modificăm tipul fieldKey pentru a include noua cheie
  const renderEditableField = (
    label: string,
    value: string,
    fieldKey: keyof EditableResult | `raportSOAP.${keyof SoapReport}` | 'reteta.instructiuni',
    rows: number = 3
  ) => (
      <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
          <textarea
              value={value}
              onChange={(e) => handleInputChange(fieldKey, e.target.value)}
              rows={rows}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm whitespace-pre-wrap"
          />
      </div>
  );

  const renderContent = () => {
    // ... logica rămâne similară ...
    const id = activeTab;
    const isCopied = copiedStates[id];
    const currentDiagnostice = editableResult.diagnosticePosibile || [];
    const currentPasi = editableResult.pasiUrmatori || [];
    const currentHasPrescription = result.reteta && Array.isArray(result.reteta.medicatie) && result.reteta.medicatie.length > 0;

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
                    {renderEditableField("Editează rezumatul:", editableResult.rezumat, 'rezumat', 5)}
                </div>
            )}
            {id === 'raport' && (
                 <div>
                    <h3 className="text-xl font-bold mb-3 text-primary-700 dark:text-primary-400">Raport Medical (SOAP)</h3>
                    <div className="space-y-1">
                        {renderEditableField("S (Subiectiv)", editableResult.raportSOAP.Subiectiv, 'raportSOAP.Subiectiv', 4)}
                        {renderEditableField("O (Obiectiv)", editableResult.raportSOAP.Obiectiv, 'raportSOAP.Obiectiv', 3)}
                        {renderEditableField("A (Analiză)", editableResult.raportSOAP.Analiza, 'raportSOAP.Analiza', 3)}
                        {renderEditableField("P (Plan)", editableResult.raportSOAP.Plan, 'raportSOAP.Plan', 4)}
                    </div>
                 </div>
            )}
            {id === 'diagnostice' && (
                <div>
                    <h3 className="text-xl font-bold mb-3 text-primary-700 dark:text-primary-400">Diagnostice Posibile</h3>
                    { currentDiagnostice.length > 0 ? (
                        <ul className="list-disc list-inside space-y-2">
                            {currentDiagnostice.map((diag, i) => <li key={i}>{diag}</li>)}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">Niciun diagnostic posibil identificat.</p>
                    )}
                </div>
            )}
            {id === 'pasi' && (
                <div>
                    <h3 className="text-xl font-bold mb-3 text-primary-700 dark:text-primary-400">Pași Următori Recomandați</h3>
                     { currentPasi.length > 0 ? (
                        <ul className="list-disc list-inside space-y-2">
                            {currentPasi.map((pas, i) => <li key={i}>{pas}</li>)}
                        </ul>
                     ) : (
                        <p className="text-gray-500 dark:text-gray-400">Niciun pas următor identificat.</p>
                     )}
                </div>
            )}
            {id === 'reteta' && (
                <div>
                    <div id="printable-area">
                        <h3 className="text-2xl font-bold mb-6 text-center text-primary-700 dark:text-primary-400">Rețetă Medicală</h3>
                        {currentHasPrescription ? (
                            <div className="space-y-6 text-base">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 border-b pb-4">
                                    <p><strong>Pacient:</strong> {result.patientName || 'Nespecificat'}</p>
                                    <p><strong>CNP:</strong> {result.patientCnp || 'Nespecificat'}</p>
                                    {result.reteta?.numeDoctor && <p className="col-span-2"><strong>Medic:</strong> Dr. {result.reteta.numeDoctor}</p>}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Medicație Prescrisă:</h4>
                                    <ul className="list-decimal list-inside pl-4 space-y-1">
                                    {(result.reteta?.medicatie || []).map((med, i) => <li key={i}>{med}</li>)}
                                    </ul>
                                </div>
                                {/* Am înlocuit <p> cu renderEditableField pentru instrucțiuni */}
                                <div className="-mb-4"> {/* Ajustăm marginile pentru textarea */}
                                    {renderEditableField("Instrucțiuni:", editableResult.reteta.instructiuni, 'reteta.instructiuni', 4)}
                                </div>
                                <div className="pt-10 mt-10">
                                    {/* ... restul secțiunii de printare ... */}
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
                        <div className="flex items-center justify-center gap-4">
                            <input type="file" accept="image/*" ref={signatureInputRef} onChange={handleSignatureUpload} className="hidden" />
                            <button onClick={() => signatureInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                <UploadCloudIcon className="w-4 h-4" />
                                {signature ? 'Schimbă Semnătura' : 'Încarcă Semnătura'}
                            </button>
                            <button onClick={handlePrint} disabled={!currentHasPrescription} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
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
    // ... restul componentei ...
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