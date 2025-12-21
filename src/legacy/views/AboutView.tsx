/**
 * AboutView Component
 *
 * About/How to Play view.
 */

interface AboutViewProps {
  onBack: () => void;
}

export function AboutView({ onBack }: AboutViewProps) {
  return (
    <div className="about-view">
      <h1>How to Play</h1>
      <p>Spin the wheel to get a story prompt, then record your story!</p>
      <button onClick={onBack}>Back to Wheel</button>
    </div>
  );
}
