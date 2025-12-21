/**
 * StoriesView Component
 *
 * View for displaying saved stories.
 */

interface StoriesViewProps {
  onBack: () => void;
}

export function StoriesView({ onBack }: StoriesViewProps) {
  return (
    <div className="stories-view">
      <h1>My Stories</h1>
      <p>Your recorded stories will appear here.</p>
      <button onClick={onBack}>Back to Wheel</button>
    </div>
  );
}
