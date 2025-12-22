# Audio Recording — Claude Skill

**Purpose:** Guide implementation of audio recording for The Story Portal  
**References:** `docs/APP_SPECIFICATION.md` §3-4, `docs/USER_FLOWS.md` §4

---

## Overview

The Story Portal captures spontaneous, single-take audio stories. Recording should feel intimate and conversational—not like a production studio.

### Design Principles

| Principle | Implication |
|-----------|-------------|
| Single-take authenticity | No editing, no filters, no post-production |
| Intimate, not performative | Waveform feedback should be subtle, not intimidating |
| Offline-first | Recording must work without network |
| Forgiveness | Re-record option preserves previous take until new save |

---

## Technical Specifications

### Audio Format

| Setting | Value | Rationale |
|---------|-------|-----------|
| Format (preferred) | WebM (Opus codec) | Best compression, wide support |
| Format (fallback) | MP4 (AAC codec) | Safari compatibility |
| Bitrate | 64-128kbps | Sufficient for voice, small file size |
| Channels | Mono | Voice doesn't need stereo |
| Sample rate | 48kHz | Browser default, good quality |

### Duration Limits

| Limit | Value | Behavior |
|-------|-------|----------|
| Maximum | 5 minutes | Auto-stop at limit |
| Warning | 4:30 | Visual pulse, "30 seconds remaining" |
| Minimum | None | Even 1-second stories are valid |

### Estimated File Sizes

| Duration | Size (64kbps) | Size (128kbps) |
|----------|---------------|----------------|
| 1 minute | ~480KB | ~960KB |
| 3 minutes | ~1.4MB | ~2.9MB |
| 5 minutes | ~2.4MB | ~4.8MB |

---

## MediaRecorder API

### Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge | ✅ Full | WebM + Opus |
| Firefox | ✅ Full | WebM + Opus |
| Safari | ⚠️ Partial | MP4 + AAC only (iOS 14.3+) |

### Format Detection

```typescript
// Determine supported MIME type
function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
  ];
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  
  throw new Error('No supported audio format found');
}
```

### Basic Recording Pattern

```typescript
interface RecordingState {
  status: 'idle' | 'recording' | 'paused' | 'stopped';
  duration: number;
  blob: Blob | null;
  error: Error | null;
}

// Request microphone access
const stream = await navigator.mediaDevices.getUserMedia({ 
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 48000,
  } 
});

// Create recorder
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: getSupportedMimeType(),
  audioBitsPerSecond: 96000, // 96kbps middle ground
});

// Collect chunks
const chunks: Blob[] = [];
mediaRecorder.ondataavailable = (e) => {
  if (e.data.size > 0) {
    chunks.push(e.data);
  }
};

// Assemble final blob
mediaRecorder.onstop = () => {
  const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
  // Store blob with localforage
};

// Start with timeslice for incremental data
mediaRecorder.start(1000); // Emit data every second
```

### Pause/Resume

```typescript
// Pause
if (mediaRecorder.state === 'recording') {
  mediaRecorder.pause();
}

// Resume
if (mediaRecorder.state === 'paused') {
  mediaRecorder.resume();
}
```

### Stop and Cleanup

```typescript
// Stop recording
mediaRecorder.stop();

// Release microphone
stream.getTracks().forEach(track => track.stop());
```

---

## Waveform Visualization

### Approach

Use Web Audio API's AnalyserNode to get frequency/time data, render to canvas.

```typescript
// Setup analyser
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaStreamSource(stream);
source.connect(analyser);

// Configure
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Animation loop
function draw() {
  if (status !== 'recording') return;
  
  requestAnimationFrame(draw);
  analyser.getByteFrequencyData(dataArray);
  
  // Render bars/waveform to canvas
  // Keep it subtle—warm amber, not aggressive green
}
```

### Visual Style

| Element | Style | Rationale |
|---------|-------|-----------|
| Color | Warm amber (#D4A574) | Matches steampunk aesthetic |
| Shape | Soft bars or smooth wave | Not harsh/digital looking |
| Animation | Gentle, flowing | Intimate, not intimidating |
| Size | Small, unobtrusive | Focus is on storytelling, not meters |

---

## Timer Implementation

### Display Format

```typescript
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Display: "2:34" not "00:02:34" or "154 seconds"
```

### Warning States

| Time | State | Visual |
|------|-------|--------|
| 0:00 - 4:29 | Normal | Standard timer display |
| 4:30 - 4:59 | Warning | Timer pulses, color shift to amber |
| 5:00 | Auto-stop | Recording ends, transition to Review |

---

## Error Handling

### Permission Denied

```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (err) {
  if (err.name === 'NotAllowedError') {
    // User denied permission
    // Show friendly error per USER_FLOWS.md §9.1
  } else if (err.name === 'NotFoundError') {
    // No microphone found
  } else {
    // Other error
  }
}
```

### Recording Interrupted

Triggers: Phone call, tab hidden, screen lock, app backgrounded.

```typescript
document.addEventListener('visibilitychange', () => {
  if (document.hidden && mediaRecorder?.state === 'recording') {
    // Recording may be interrupted
    // Browser behavior varies—some pause, some stop
    // Check state on return and handle gracefully
  }
});
```

### Error Messages

See `docs/USER_FLOWS.md` §9 for exact copy and flows.

---

## Integration Points

### With Consent Flow

Recording starts AFTER consent is confirmed:
- Self recording: Quick affirm → Start
- Recording others: Tap consent → Email → Start → Verbal consent in audio

### With Local Storage

```typescript
import localforage from 'localforage';

// Save recording
await localforage.setItem(`story_${storyId}`, {
  audioBlob: blob,
  prompt: selectedPrompt,
  timestamp: new Date().toISOString(),
  duration: recordingDuration,
  consent: consentData,
});
```

### With UI States

| State | UI Elements |
|-------|-------------|
| Idle | Record button visible in Contemplation |
| Recording | Waveform, timer, Pause/Stop buttons |
| Paused | "Paused" indicator, Resume/Stop buttons |
| Review | Playback controls, Keep/Re-record buttons |

---

## Testing Checklist

- [ ] Records on Chrome desktop
- [ ] Records on Safari iOS (iPhone)
- [ ] Records on Chrome Android
- [ ] Pause/resume preserves audio continuity
- [ ] Auto-stops at 5 minutes
- [ ] Warning appears at 4:30
- [ ] Handles permission denied gracefully
- [ ] Handles tab switch/background gracefully
- [ ] Waveform animates during recording
- [ ] Timer counts up accurately
- [ ] Blob saves successfully to localforage
- [ ] Re-record preserves previous take until new save

---

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `src/hooks/useAudioRecorder.ts` | Core recording hook |
| `src/hooks/useWaveform.ts` | Waveform visualization |
| `src/components/RecordingUI.tsx` | Recording interface |
| `src/components/Waveform.tsx` | Canvas waveform display |
| `src/components/RecordingTimer.tsx` | Timer display |

---

## References

- MDN: [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- MDN: [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- `docs/USER_FLOWS.md` §4 (Recording Flows)
- `docs/USER_FLOWS.md` §9 (Error States)
- `docs/APP_SPECIFICATION.md` §4 (Audio Recording Architecture)
