import './legacy.css';
import legacyHtml from './legacy.html?raw';

export default function LegacyScreen() {
  return (
    <div
      className="legacy-root"
      dangerouslySetInnerHTML={{ __html: legacyHtml }}
    />
  );
}