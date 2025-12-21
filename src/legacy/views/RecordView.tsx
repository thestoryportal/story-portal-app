/**
 * RecordView Component
 *
 * Recording interface for story prompts.
 */

interface RecordViewProps {
  selectedPrompt: string | null;
  onBack: () => void;
}

export function RecordView({ selectedPrompt, onBack }: RecordViewProps) {
  return (
    <div className="record-view">
      <h1>Record Your Story</h1>
      {selectedPrompt && (
        <div className="prompt-display">
          <p>{selectedPrompt}</p>
        </div>
      )}
      <button onClick={onBack}>Back to Wheel</button>
    </div>
  );
}
