// @/components/KeyboardShortcuts.tsx

import React from 'react';
import { KeyboardIcon, CloseIcon } from './Icons';

interface KeyboardShortcutsProps {
  onClose: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ onClose }) => {
  const shortcuts = [
    {
      category: "Navigare",
      items: [
        { keys: ["Ctrl", "H"], description: "Deschide istoricul pacienților" },
        { keys: ["Ctrl", "K"], description: "Afișează acest ghid de scurtături" },
        { keys: ["ESC"], description: "Închide ferestrele modale" },
      ]
    },
    {
      category: "Înregistrare",
      items: [
        { keys: ["Ctrl", "R"], description: "Start/Stop înregistrare" },
        { keys: ["Ctrl", "U"], description: "Încarcă fișier audio" },
      ]
    },
    {
      category: "Rezultate",
      items: [
        { keys: ["Ctrl", "P"], description: "Tipărește raportul" },
        { keys: ["Ctrl", "S"], description: "Salvează în istoric" },
        { keys: ["Ctrl", "N"], description: "Consultație nouă" },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <KeyboardIcon className="w-8 h-8 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Scurtături Tastatură
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Închide"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((category, idx) => (
            <div key={idx} className="mb-6 last:mb-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((shortcut, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <kbd className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm text-sm font-mono font-semibold text-gray-900 dark:text-white">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-gray-500 mx-1">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-b-xl text-center text-sm text-gray-600 dark:text-gray-400">
          💡 Apasă <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">Ctrl+K</kbd> oricând pentru a vedea această listă
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
