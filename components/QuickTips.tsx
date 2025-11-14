// @/components/QuickTips.tsx

import React, { useState } from 'react';
import { LightbulbIcon, CloseIcon } from './Icons';

interface QuickTipsProps {
  onClose: () => void;
}

const QuickTips: React.FC<QuickTipsProps> = ({ onClose }) => {
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      title: "Bun venit la MediScribe!",
      content: "Asistentul tău AI pentru transcrierea consultațiilor medicale în limba română. Economisește timp și generează automat rapoarte SOAP, rețete și coduri ICD-10.",
      icon: "🎉"
    },
    {
      title: "Cum funcționează?",
      content: "1️⃣ Introdu datele pacientului\n2️⃣ Înregistrează consultația LIVE sau încarcă fișier audio\n3️⃣ Primești raport SOAP complet, rețete și alerte medicale\n4️⃣ Editează, tipărește sau salvează rezultatele",
      icon: "📋"
    },
    {
      title: "Scurtături tastatură",
      content: "⌨️ Ctrl+R - Start/Stop înregistrare\n⌨️ Ctrl+U - Încarcă fișier\n⌨️ Ctrl+H - Vezi istoric pacienți\n⌨️ Ctrl+K - Vezi scurtături\n⌨️ ESC - Închide modal",
      icon: "⚡"
    },
    {
      title: "Verificare medicamente",
      content: "MediScribe verifică automat interacțiunile medicamentoase folosind:\n✅ Nomenclatorul medicamentelor din România\n✅ Baza de date RxNorm (NIH)\n✅ Detectare automată alergii din conversație",
      icon: "💊"
    },
    {
      title: "Istoric pacienți",
      content: "Toate consultațiile sunt salvate local (în browser):\n📁 Până la 100 consultații\n🔍 Căutare rapidă după nume, CNP, diagnostic\n💾 Export JSON pentru backup\n🔒 Datele nu părăsesc niciodată browserul tău",
      icon: "🗂️"
    },
    {
      title: "Sfaturi pentru rezultate optime",
      content: "🎤 Vorbește clar și la distanță de 30-50cm de microfon\n🔊 Evită zgomotul de fond excesiv\n⏱️ Consultații de minimum 1-2 minute pentru SOAP complet\n👥 Identifică-te ca \"doctor\" la început pentru diarization mai bună",
      icon: "💡"
    }
  ];

  const handleNext = () => {
    if (currentTip < tips.length - 1) {
      setCurrentTip(currentTip + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentTip > 0) {
      setCurrentTip(currentTip - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('mediscribe_tips_shown', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <LightbulbIcon className="w-8 h-8 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ghid Rapid
            </h2>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Închide"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{tips[currentTip].icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {tips[currentTip].title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {tips[currentTip].content}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {tips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTip(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTip
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentTip === 0}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Înapoi
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentTip + 1} / {tips.length}
            </span>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {currentTip < tips.length - 1 ? 'Următorul →' : 'Am înțeles! ✓'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-b-xl">
          <label className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  localStorage.setItem('mediscribe_tips_shown', 'true');
                } else {
                  localStorage.removeItem('mediscribe_tips_shown');
                }
              }}
              className="rounded"
            />
            Nu mai arăta acest ghid
          </label>
        </div>
      </div>
    </div>
  );
};

export default QuickTips;
