# Audio Recording Implementation Plan

## Overview

Implement audio recording as the core storytelling capture mechanism.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   RecordView.tsx                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Recording  │  │  Waveform   │  │    Controls     │  │
│  │   State     │  │  Visualizer │  │  Start/Stop/    │  │
│  │  Machine    │  │             │  │  Re-record      │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 useAudioRecorder Hook                   │
│  - MediaRecorder API wrapper                            │
│  - State: idle → recording → paused → stopped           │
│  - Blob management                                      │
│  - Duration tracking                                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  useStoryStorage Hook                   │
│  - localForage wrapper                                  │
│  - Save: audio blob + metadata                          │
│  - Load: for playback in StoriesView                    │
│  - Delete: user-initiated                               │
└─────────────────────────────────────────────────────────┘
```

## Phase 1: Core Recording (Week 1)

### 1.1 Install Dependencies

```bash
pnpm add localforage
```

### 1.2 Create useAudioRecorder Hook

**File**: `src/legacy/hooks/useAudioRecorder.ts`

```typescript
interface RecordingState {
  status: 'idle' | 'recording' | 'paused' | 'stopped';
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
}

interface UseAudioRecorderReturn {
  state: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  audioUrl: string | null;
}
```

**Key Implementation Details:**
- Use `navigator.mediaDevices.getUserMedia({ audio: true })`
- Prefer `audio/webm;codecs=opus` with `audio/mp4` fallback for Safari
- Track duration with `setInterval` during recording
- Enforce 5-minute maximum
- Clean up MediaRecorder and streams on unmount

### 1.3 Create useStoryStorage Hook

**File**: `src/legacy/hooks/useStoryStorage.ts`

```typescript
interface Story {
  id: string;
  promptId: number;
  promptText: string;
  audioBlob: Blob;
  duration: number;
  recordedAt: Date;
  storytellerName?: string;
  storytellerEmail?: string;
  consentType: 'self' | 'verbal' | 'verbal_and_tap';
  photoBlob?: Blob;
}

interface UseStoryStorageReturn {
  saveStory: (story: Omit<Story, 'id'>) => Promise<string>;
  getStory: (id: string) => Promise<Story | null>;
  getAllStories: () => Promise<Story[]>;
  deleteStory: (id: string) => Promise<void>;
  storageUsed: number;
}
```

**Storage Schema (localForage):**
- Key: `story_${uuid}`
- Value: Story object with Blob stored directly

### 1.4 Update RecordView

**File**: `src/legacy/views/RecordView.tsx`

```tsx
// States to implement:
// 1. Pre-recording: Show prompt, "Ready to record?" message
// 2. Recording: Waveform, timer, pause/stop buttons
// 3. Review: Playback, re-record option, save button
// 4. Saved: Confirmation, return to wheel
```

**UI Components Needed:**
- `RecordingTimer` - MM:SS display, turns red at 4:30
- `WaveformVisualizer` - Canvas-based audio visualization
- `RecordingControls` - Start, pause, stop, re-record buttons

## Phase 2: Storage & Playback (Week 2)

### 2.1 Update StoriesView

- Load stories from localForage
- Display as list with prompt, date, duration
- Playback with `<audio>` element
- Delete functionality with confirmation

### 2.2 Story Card Component

```tsx
interface StoryCardProps {
  story: Story;
  onPlay: () => void;
  onDelete: () => void;
}
```

## Phase 3: Consent Flow (Week 3)

### 3.1 Self vs. Other Detection

Before recording, ask: "Are you recording your own story or someone else's?"

### 3.2 Consent UI for Others

```
┌─────────────────────────────────────────┐
│  Recording Someone Else's Story         │
│                                         │
│  Please have them:                      │
│  1. State their name                    │
│  2. Say "I consent to this recording"   │
│                                         │
│  Storyteller's name: [____________]     │
│  Email (optional):   [____________]     │
│                                         │
│  [ ] I confirm verbal consent was given │
│                                         │
│  [Start Recording]                      │
└─────────────────────────────────────────┘
```

## Browser Compatibility

| Browser | Format | Notes |
|---------|--------|-------|
| Chrome/Edge | audio/webm;codecs=opus | ✓ Best quality |
| Firefox | audio/webm;codecs=opus | ✓ |
| Safari | audio/mp4 | Fallback required |
| iOS Safari | audio/mp4 | May need user gesture |

## Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| No microphone | "Please allow microphone access" | Show settings link |
| Permission denied | "Microphone permission is required" | Retry button |
| Recording failed | "Something went wrong. Please try again." | Re-record option |
| Storage full | "Device storage is full" | Suggest deleting old stories |

## Testing Checklist

- [ ] Recording starts within 500ms of tap
- [ ] Timer displays correctly
- [ ] Pause/resume works
- [ ] 5-minute limit enforced
- [ ] Re-record clears previous
- [ ] Audio plays back correctly
- [ ] Storage persists across sessions
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] Works on desktop browsers
