// @/components/AnalysisView.tsx

import React, { useState, useEffect, useRef } from 'react';
import type { AnalysisResult, SoapReport } from '../types';
import { ClipboardIcon, ClipboardCheckIcon, RefreshCwIcon, PrinterIcon, UploadCloudIcon, SaveIcon, FileTextIcon, AlertTriangleIcon, BadgeInfoIcon } from './Icons';

interface AnalysisViewProps {
  result: AnalysisResult & { patientName?: string; patientCnp?: string; };
  rawTranscript: string;
  onReset: () => void;
}

// Am adăugat 'transcript' și 'alerte' la tipul Tab
type Tab = 'rezumat' | 'raport' | 'diagnostice' | 'pasi' | 'reteta' | 'transcript' | 'alerte';

type EditableResult = {
  rezumat: string;
  raportSOAP: SoapReport;
  diagnosticePosibile: string[];
  coduriICD10Sugerate?: string[];
  pasiUrmatori: string[];
  reteta: {
    medicatie: string[];
    instructiuni: string;
    numeDoctor?: string;
  };
  alerteMedicale?: string[];
};

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, rawTranscript, onReset }) => {
  const [activeTab, setActiveTab] = useState<Tab>('raport');
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [signature, setSignature] = useState<string | null>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const [editableResult, setEditableResult] = useState<EditableResult>(() => ({
    rezumat: result.rezumat || '',
    raportSOAP: {
      Subiectiv: result.raportSOAP?.Subiectiv || '',
      Obiectiv: result.raportSOAP?.Obiectiv || '',
      Analiza: result.raportSOAP?.Analiza || '',
      Plan: result.raportSOAP?.Plan || '',
    },
    diagnosticePosibile: Array.isArray(result.diagnosticePosibile) ? [...result.diagnosticePosibile] : [],
    coduriICD10Sugerate: Array.isArray(result.coduriICD10Sugerate) ? [...result.coduriICD10Sugerate] : [],
    pasiUrmatori: Array.isArray(result.pasiUrmatori) ? [...result.pasiUrmatori] : [],
    reteta: {
      medicatie: Array.isArray(result.reteta?.medicatie) ? [...result.reteta.medicatie] : [],
      instructiuni: result.reteta?.instructiuni || '',
      numeDoctor: result.reteta?.numeDoctor || '',
    },
    alerteMedicale: Array.isArray(result.alerteMedicale) ? [...result.alerteMedicale] : [],
  }));

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
      coduriICD10Sugerate: Array.isArray(result.coduriICD10Sugerate) ? [...result.coduriICD10Sugerate] : [],
      pasiUrmatori: Array.isArray(result.pasiUrmatori) ? [...result.pasiUrmatori] : [],
      reteta: {
        medicatie: Array.isArray(result.reteta?.medicatie) ? [...result.reteta.medicatie] : [],
        instructiuni: result.reteta?.instructiuni || '',
        numeDoctor: result.reteta?.numeDoctor || '',
      },
      alerteMedicale: Array.isArray(result.alerteMedicale) ? [...result.alerteMedicale] : [],
    });
  }, [result]);

  const hasPrescription = result.reteta && Array.isArray(result.reteta.medicatie) && result.reteta.medicatie.length > 0;
  // Folosim starea editabilă aici, deoarece este actualizată în useEffect
  const hasAlerts = editableResult.alerteMedicale && editableResult.alerteMedicale.length > 0;

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
          if (!signature && hasPrescription) {
      if (!confirm("Atenție: Nu ați adăugat o semnătură pentru rețetă. Doriți să printați oricum?")) {
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
    const diagnosticeText = (result.diagnosticePosibile || []).join('\n- ');
    const coduriText = (result.coduriICD10Sugerate || []).join(', ');
    const pasiText = (result.pasiUrmatori || []).join('\n- ');
    const medicatieText = (result.reteta?.medicatie || []).join('\n- ');
    // Folosim starea editabilă pentru alerte
    const alerteText = (editableResult.alerteMedicale || []).join('\n- ');

    switch (tab) {
        case 'rezumat':
            return `Rezumat Consultație:\n\n${editableResult.rezumat}`;
        case 'raport':
            let raport = `Raport SOAP:\n\nSubiectiv:\n${editableResult.raportSOAP.Subiectiv}\n\nObiectiv:\n${editableResult.raportSOAP.Obiectiv}\n\nAnaliză:\n${editableResult.raportSOAP.Analiza}\n\nPlan:\n${editableResult.raportSOAP.Plan}`;
            if (coduriText) {
                raport += `\n\nCoduri ICD-10 Sugerate: ${coduriText}`;
            }
            return raport;
        case 'diagnostice':
             let diagText = `Diagnostice Posibile:\n\n- ${diagnosticeText}`;
             if (coduriText) {
                 diagText += `\n\nCoduri ICD-10 Sugerate: ${coduriText}`;
             }
             return diagText;
        case 'pasi':
            return `Pași Următori Recomandați:\n\n- ${pasiText}`;
        case 'reteta':
            const patientInfo = `Pacient: ${result.patientName || 'Nespecificat'}\nCNP: ${result.patientCnp || 'Nespecificat'}\n`;
            return `Rețetă Medicală:\n\n${patientInfo}Medic: Dr. ${result.reteta?.numeDoctor || 'Nespecificat'}\n\nMedicație:\n- ${medicatieText}\n\nInstrucțiuni:\n${editableResult.reteta.instructiuni}`;
        case 'transcript':
            return `Transcriere Brută:\n\n${rawTranscript}`;
        case 'alerte':
            return `Alerte Medicale Identificate:\n\n- ${alerteText}`;
        default:
            return '';
    }
  };

  // Definim tipul corect pentru array-ul de tab-uri
  const tabs: Array<{ id: Tab; label: string; icon?: React.FC<any> }> = [
    { id: 'rezumat', label: 'Rezumat' },
    { id: 'raport', label: 'Raport SOAP' },
    { id: 'diagnostice', label: 'Diagnostice' },
    { id: 'pasi', label: 'Pași Următori' },
    { id: 'reteta', label: 'Rețetă' },
    { id: 'transcript', label: 'Transcriere', icon: FileTextIcon },
    // Adăugăm tab-ul Alerte doar dacă există alerte
    ...(hasAlerts ? [{ id: 'alerte' as Tab, label: 'Alerte', icon: AlertTriangleIcon }] : []),
  ];

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
    const id = activeTab;
    const isCopied = copiedStates[id];
    const currentDiagnostice = editableResult.diagnosticePosibile || [];
    const currentCoduri = editableResult.coduriICD10Sugerate || [];
    // Folosim starea editabilă aici
    const currentAlerte = editableResult.alerteMedicale || [];
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
                        {currentCoduri.length > 0 && (
                            <div className="pt-2">
                                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <BadgeInfoIcon className="w-4 h-4" /> Coduri ICD-10 Sugerate:
                                </h4>
                                <p className="pl-2 ml-2 text-sm text-gray-600 dark:text-gray-400">{currentCoduri.join(', ')}</p>
                            </div>
                        )}
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
                    {currentCoduri.length > 0 && (
                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                             <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                <BadgeInfoIcon className="w-5 h-5" /> Coduri ICD-10 Sugerate:
                             </h4>
                             <p className="pl-2 ml-2 mt-1 text-gray-600 dark:text-gray-400">{currentCoduri.join(', ')}</p>
                             <p className="text-xs text-gray-500 dark:text-gray-400 ml-4 mt-1">(Aceste coduri sunt sugestii AI și necesită verificare medicală)</p>
                        </div>
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
                                     <p className="col-span-2"><strong>Data și Ora:</strong> {new Date().toLocaleString('ro-RO')}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Medicație Prescrisă:</h4>
                                    <ul className="list-decimal list-inside pl-4 space-y-1">
                                    {(result.reteta?.medicatie || []).map((med, i) => <li key={i}>{med}</li>)}
                                    </ul>
                                </div>
                                <div className="-mb-4">
                                    {renderEditableField("Instrucțiuni:", editableResult.reteta.instructiuni, 'reteta.instructiuni', 4)}
                                </div>
                                <div className="pt-10 mt-10">
                                         <div className="flex justify-between items-end">
                                        <div></div>
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
            {id === 'transcript' && (
                <div>
                    <h3 className="text-xl font-bold mb-3 text-primary-700 dark:text-primary-400 flex items-center gap-2">
                       <FileTextIcon className="w-5 h-5"/> Transcriere Brută (Deepgram)
                    </h3>
                    <textarea
                        readOnly
                        value={rawTranscript}
                        rows={15}
                        className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm whitespace-pre-wrap font-mono text-xs"
                    />
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Acesta este textul exact returnat de serviciul de transcriere, inclusiv etichetele [DOCTOR]/[PACIENT].</p>
                </div>
            )}
             {id === 'alerte' && (
                <div>
                     <h3 className="text-xl font-bold mb-3 text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertTriangleIcon className="w-5 h-5"/> Alerte Medicale Sugerate
                     </h3>
                     {/* Folosim currentAlerte aici */}
                    { currentAlerte.length > 0 ? (
                        <ul className="list-disc list-inside space-y-2 pl-4 text-orange-700 dark:text-orange-300">
                            {currentAlerte.map((alerta, i) => <li key={i}>{alerta}</li>)}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">Nicio alertă identificată.</p>
                    )}
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">(Aceste alerte sunt sugestii AI bazate pe text și necesită verificare medicală aprofundată)</p>
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
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? (tab.id === 'alerte' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-primary-500 text-primary-600 dark:text-primary-400')
                  : (tab.id === 'alerte' ? 'border-transparent text-red-600 dark:text-red-400 opacity-70 hover:opacity-100 hover:border-red-300' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500')
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-1.5`}
            >
              {tab.icon && <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? '' : 'opacity-80'}`} />}
              {tab.label}
              {/* Folosim currentAlerte aici pentru număr */}
              {tab.id === 'alerte' && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-xs font-semibold">{(editableResult.alerteMedicale || []).length}</span>}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2">{renderContent()}</div>
    </div>
  );
};

export default AnalysisView;