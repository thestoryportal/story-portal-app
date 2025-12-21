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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '40px',
        overflow: 'auto',
        touchAction: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          background: 'rgba(0,0,0,0.8)',
          padding: '40px',
          borderRadius: '12px',
          border: '3px solid #8B6F47',
        }}
      >
        <h1
          style={{
            color: '#f5deb3',
            fontSize: '32px',
            marginBottom: '24px',
            textAlign: 'center',
            textShadow: '2px 2px 4px #000',
          }}
        >
          Record Your Story
        </h1>
        {selectedPrompt && (
          <div
            style={{
              background: 'rgba(139,69,19,0.3)',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '32px',
              border: '2px solid #8B6F47',
            }}
          >
            <p
              style={{
                color: '#f5deb3',
                fontSize: '20px',
                fontWeight: 'bold',
                margin: 0,
                textAlign: 'center',
              }}
            >
              {selectedPrompt}
            </p>
          </div>
        )}
        <p
          style={{
            color: '#f5deb3',
            fontSize: '16px',
            lineHeight: 1.6,
            textAlign: 'center',
          }}
        >
          Recording functionality coming soon...
        </p>
        <button
          onClick={onBack}
          style={{
            marginTop: '32px',
            padding: '16px 32px',
            width: '100%',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '18px',
            background: 'linear-gradient(180deg,#6a5a4a,#2a1a0a)',
            border: '3px solid #8B6F47',
            color: '#f5deb3',
            cursor: 'pointer',
          }}
        >
          Back to Wheel
        </button>
      </div>
    </div>
  );
}
