import { useState } from 'react';
import JournalEntryDisplay from './JournalEntryDisplay';

interface JournalEntry {
  id: string;
  text: string;
  date: string;
}

interface JournalListProps {
  entries: JournalEntry[];
}

export default function JournalList({ entries }: JournalListProps) {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setCurrentAnalysis(null); // Reset analysis when selecting new entry
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Entries List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">Journal Entries</h2>
        {entries.map((entry) => (
          <div
            key={entry.id}
            onClick={() => handleEntryClick(entry)}
            className={`cursor-pointer p-4 rounded-lg shadow-sm transition-colors ${
              selectedEntry?.id === entry.id
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-sm text-gray-500 mb-1">
              {new Date(entry.date).toLocaleDateString()}
            </div>
            <div className="text-gray-800">{entry.text}</div>
          </div>
        ))}
      </div>

      {/* Analysis Panel */}
      <div className="md:sticky md:top-4">
        {selectedEntry ? (
          <JournalEntryDisplay
            entry={selectedEntry}
            onAnalysis={setCurrentAnalysis}
          />
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-sm text-center text-gray-500">
            Select an entry to see AI analysis
          </div>
        )}
      </div>
    </div>
  );
} 