
import React, { useEffect, useRef } from 'react';
import type { TranscriptLine } from '../types';

interface TranscriptionViewProps {
  transcript: TranscriptLine[];
  interimTranscript: string;
}

const TranscriptionView: React.FC<TranscriptionViewProps> = ({ transcript, interimTranscript }) => {
    const endOfTranscriptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfTranscriptRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript, interimTranscript]);

  return (
    <div className="overflow-y-auto h-full pr-4 -mr-4 text-lg leading-relaxed space-y-3">
      {transcript.map((line, index) => (
        <div key={index}>
          <span className={`font-bold ${line.speaker === 'Doctor' ? 'text-primary-600 dark:text-primary-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {line.speaker}:
          </span>
          <span className="ml-2">{line.text}</span>
        </div>
      ))}
      <p className="text-gray-500 dark:text-gray-400">{interimTranscript}</p>
      <div ref={endOfTranscriptRef} />
    </div>
  );
};

export default TranscriptionView;