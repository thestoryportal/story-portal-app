# Component Patterns Reference

## Architecture Overview

```
src/
├── components/
│   ├── App.tsx              # Root component, view routing
│   ├── StoryWheel/
│   │   ├── index.tsx        # Wheel container
│   │   ├── WheelPanel.tsx   # Individual prompt panel
│   │   ├── WheelPhysics.ts  # Physics calculations
│   │   └── styles.css       # Wheel-specific styles
│   ├── PortalRing/
│   │   ├── index.tsx        # Ring overlay
│   │   └── ElectricityEffect.tsx  # WebGL effect
│   ├── Navigation/
│   │   ├── HamburgerMenu.tsx
│   │   └── MenuPanel.tsx
│   └── shared/
│       ├── Button.tsx       # Reusable button variants
│       └── Icon.tsx         # Icon wrapper
├── hooks/
│   ├── useWheelPhysics.ts   # Wheel spin state
│   ├── useResponsive.ts     # Viewport detection
│   └── useAnimation.ts      # Animation frame loop
├── utils/
│   ├── geometry.ts          # Wheel calculations
│   └── colors.ts            # Color constants
└── types/
    └── index.ts             # TypeScript interfaces
```

## Component Template

```tsx
import { useState, useRef, useEffect } from 'react';

interface ComponentNameProps {
  /** Required prop description */
  requiredProp: string;
  /** Optional prop description */
  optionalProp?: number;
  /** Callback description */
  onAction?: (value: string) => void;
}

export function ComponentName({
  requiredProp,
  optionalProp = 10,
  onAction
}: ComponentNameProps) {
  // State
  const [localState, setLocalState] = useState(false);
  
  // Refs
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Effects
  useEffect(() => {
    // Setup logic
    return () => {
      // Cleanup logic
    };
  }, [/* dependencies */]);
  
  // Handlers
  const handleClick = () => {
    onAction?.(requiredProp);
  };
  
  // Render
  return (
    <div ref={elementRef} className="component-name">
      {/* JSX */}
    </div>
  );
}
```

## Key Interfaces

### Prompt
```typescript
interface Prompt {
  id: string;
  text: string;
  category?: 'memories' | 'transformation' | 'art' | 'community';
}
```

### Story
```typescript
interface Story {
  id: string;
  promptId: string;
  promptText: string;
  audioBlob: Blob;
  photos: Blob[];
  metadata: StoryMetadata;
  timestamp: number;
  duration: number;
}

interface StoryMetadata {
  realName?: string;
  playaName?: string;
  year?: number;
  camp?: string;
  email?: string;
  consent: ConsentFlags;
}

interface ConsentFlags {
  recording: boolean;
  loveBurnSharing: boolean;
  storyPortalSharing: boolean;
  emailUpdates: boolean;
}
```

### Wheel State
```typescript
interface WheelState {
  rotation: number;        // Current rotation in degrees
  velocity: number;        // Degrees per frame
  isSpinning: boolean;     // Currently in motion
  selectedIndex: number;   // Currently selected prompt index
  animationPhase: AnimationPhase;
}

type AnimationPhase = 
  | 'idle'
  | 'spinning'
  | 'snapping'
  | 'spinOut'
  | 'hold'
  | 'snapBack'
  | 'showText';
```

### View State
```typescript
type ViewName = 'wheel' | 'record' | 'stories' | 'about';

interface AppState {
  currentView: ViewName;
  selectedPrompt: Prompt | null;
  menuOpen: boolean;
}
```

## Custom Hooks

### useWheelPhysics
```typescript
function useWheelPhysics(panelCount: number) {
  const [state, setState] = useState<WheelState>(initialState);
  const frameRef = useRef<number>();
  
  const spin = (initialVelocity: number) => { /* ... */ };
  const drag = (deltaY: number) => { /* ... */ };
  const stop = () => { /* ... */ };
  
  return { state, spin, drag, stop };
}
```

### useResponsive
```typescript
function useResponsive() {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024
  });
  
  // Resize listener...
  
  return viewport;
}
```

### useAnimationFrame
```typescript
function useAnimationFrame(callback: (deltaTime: number) => void) {
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  useEffect(() => {
    const loop = (time: number) => {
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      callback(delta);
      frameRef.current = requestAnimationFrame(loop);
    };
    
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current!);
  }, [callback]);
}
```

## State Management Patterns

### Lifting State
```tsx
// Parent owns state, passes down handlers
function App() {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  return (
    <>
      <StoryWheel onPromptSelect={setSelectedPrompt} />
      <RecordButton disabled={!selectedPrompt} prompt={selectedPrompt} />
    </>
  );
}
```

### Ref for Animation State
```tsx
// Use refs for values that change every frame
function WheelContainer() {
  const velocityRef = useRef(0);    // Changes 60x/sec
  const [rotation, setRotation] = useState(0);  // Triggers re-render
  
  // Update ref in animation loop (no re-render)
  // Only setState when animation completes
}
```

## Performance Patterns

### Avoid Layout Thrash
```tsx
// BAD - reads then writes in loop
elements.forEach(el => {
  const width = el.offsetWidth;  // Forces layout
  el.style.width = width + 10 + 'px';  // Triggers layout
});

// GOOD - batch reads, then batch writes
const widths = elements.map(el => el.offsetWidth);
elements.forEach((el, i) => {
  el.style.width = widths[i] + 10 + 'px';
});
```

### Memoization
```tsx
// Memoize expensive calculations
const wheelGeometry = useMemo(() => 
  calculateWheelGeometry(viewportWidth, panelCount),
  [viewportWidth, panelCount]
);

// Memoize callbacks passed to children
const handleSpin = useCallback(() => {
  spin(15 + Math.random() * 10);
}, [spin]);
```

### CSS Transform vs Layout Properties
```tsx
// BAD - triggers layout
<div style={{ left: position, top: position }} />

// GOOD - GPU accelerated
<div style={{ transform: `translate(${x}px, ${y}px)` }} />
```

## Event Handling

### Touch Events
```tsx
const handleTouchStart = (e: React.TouchEvent) => {
  touchStartY.current = e.touches[0].clientY;
};

const handleTouchMove = (e: React.TouchEvent) => {
  e.preventDefault(); // Prevent scroll
  const deltaY = e.touches[0].clientY - touchStartY.current;
  drag(deltaY * TOUCH_SENSITIVITY);
  touchStartY.current = e.touches[0].clientY;
};
```

### Wheel Events
```tsx
const handleWheel = (e: React.WheelEvent) => {
  e.preventDefault();
  drag(e.deltaY * SCROLL_SENSITIVITY);
};
```

## Testing Patterns

### Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';

test('wheel spins on button click', () => {
  render(<StoryWheel prompts={mockPrompts} />);
  
  fireEvent.click(screen.getByRole('button', { name: /spin/i }));
  
  // Assert wheel is spinning...
});
```

### Hook Tests
```typescript
import { renderHook, act } from '@testing-library/react';

test('useWheelPhysics applies friction', () => {
  const { result } = renderHook(() => useWheelPhysics(20));
  
  act(() => {
    result.current.spin(20);
  });
  
  // Fast forward animation frames...
  expect(result.current.state.velocity).toBeLessThan(20);
});
```
