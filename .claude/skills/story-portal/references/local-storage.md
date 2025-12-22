# Local Storage — Claude Skill

**Purpose:** Guide implementation of story persistence with localforage  
**References:** `docs/APP_SPECIFICATION.md` §3-4, `docs/USER_FLOWS.md` §6, §9.4

---

## Overview

Stories are stored locally using IndexedDB (via localforage). This enables offline-first operation and keeps user data private until they choose to share (Phase 2).

### Design Principles

| Principle | Implication |
|-----------|-------------|
| Offline-first | All storage operations must work without network |
| User owns their data | Easy deletion, clear data model |
| Resilient | Handle quota errors, write failures gracefully |
| Future-proof | Schema versioning for Phase 2 cloud sync |

---

## Dependencies

```bash
pnpm add localforage
```

---

## Configuration

```typescript
import localforage from 'localforage';

// Configure instance for stories
const storyStorage = localforage.createInstance({
  name: 'story-portal',
  storeName: 'stories',
  description: 'Recorded stories with audio and metadata',
});

// Configure instance for app state
const appStorage = localforage.createInstance({
  name: 'story-portal',
  storeName: 'app-state',
  description: 'Application state and preferences',
});
```

---

## Data Schema

### Story Record

```typescript
interface StoryRecord {
  // Identity
  id: string;                    // UUID v4
  version: 1;                    // Schema version for migrations
  
  // Content
  audioBlob: Blob;               // Recorded audio
  prompt: {
    id: number;
    text: string;
    category: string;
  };
  photo?: Blob;                  // Optional attached photo
  
  // Metadata
  timestamp: string;             // ISO 8601
  duration: number;              // Seconds
  
  // Consent (from USER_FLOWS.md §4)
  consent: ConsentMetadata;
}

interface ConsentMetadata {
  type: 'self' | 'other';
  tapConsentTimestamp?: string;  // When they tapped "I Consent"
  verbalConsentInAudio: boolean; // Always true for 'other'
  storytellerEmail?: string;     // Optional, for follow-up
  storytellerName?: string;      // Optional, entered by Connector
}
```

### App State

```typescript
interface AppState {
  // Onboarding
  hasCompletedOnboarding: boolean;
  firstLaunchTimestamp?: string;
  
  // Spin state (resets on topic pack change)
  currentSpinCount: number;      // 0, 1, or 2
  currentTopicPack: string;      // Pack ID
  
  // Preferences (future)
  // ...
}
```

---

## Core Operations

### Generate Story ID

```typescript
function generateStoryId(): string {
  return crypto.randomUUID();
}
```

### Save Story

```typescript
async function saveStory(story: StoryRecord): Promise<void> {
  try {
    await storyStorage.setItem(story.id, story);
  } catch (error) {
    if (isQuotaExceededError(error)) {
      throw new StorageFullError('Device storage is full');
    }
    throw new StorageWriteError('Failed to save story', error);
  }
}

function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
     error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}
```

### Get Story

```typescript
async function getStory(id: string): Promise<StoryRecord | null> {
  return await storyStorage.getItem(id);
}
```

### Get All Stories

```typescript
async function getAllStories(): Promise<StoryRecord[]> {
  const stories: StoryRecord[] = [];
  
  await storyStorage.iterate((value: StoryRecord) => {
    stories.push(value);
  });
  
  // Sort by timestamp, newest first
  return stories.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
```

### Delete Story

```typescript
async function deleteStory(id: string): Promise<void> {
  await storyStorage.removeItem(id);
}
```

### Get Storage Stats

```typescript
async function getStorageStats(): Promise<{
  storyCount: number;
  estimatedSize: number;
}> {
  let count = 0;
  let size = 0;
  
  await storyStorage.iterate((value: StoryRecord) => {
    count++;
    size += value.audioBlob.size;
    if (value.photo) {
      size += value.photo.size;
    }
  });
  
  return { storyCount: count, estimatedSize: size };
}
```

---

## Error Handling

### Custom Error Types

```typescript
class StorageFullError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageFullError';
  }
}

class StorageWriteError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'StorageWriteError';
  }
}
```

### Error Recovery (MVP)

Per USER_FLOWS.md §9.4, MVP uses simple error + manual retry:

```typescript
async function saveStoryWithRetry(
  story: StoryRecord,
  onError: (error: Error) => void
): Promise<boolean> {
  try {
    await saveStory(story);
    return true;
  } catch (error) {
    onError(error as Error);
    return false;
  }
}

// UI shows:
// - "Couldn't Save Story" message
// - [Retry] button → calls saveStoryWithRetry again
// - [Try Later] button → story held in memory (lost if app closes)
```

### Storage Full Handling

```typescript
// When StorageFullError is caught:
// 1. Show error message per USER_FLOWS.md §9.2
// 2. Offer "Manage Stories" → navigate to My Stories
// 3. User deletes old stories to free space
// 4. User retries save
```

---

## Re-record Safety

Per USER_FLOWS.md §2, re-record preserves previous take:

```typescript
interface RecordingSession {
  currentTake: Blob | null;
  previousTake: Blob | null;
}

function startRerecord(session: RecordingSession): RecordingSession {
  return {
    previousTake: session.currentTake, // Preserve
    currentTake: null,                  // Clear for new recording
  };
}

function saveRecording(session: RecordingSession, storyId: string): void {
  // Only now do we discard previousTake
  // by saving currentTake as the story
}

function cancelRerecord(session: RecordingSession): RecordingSession {
  return {
    currentTake: session.previousTake, // Restore
    previousTake: null,
  };
}
```

---

## App State Management

### Initialize

```typescript
async function initializeAppState(): Promise<AppState> {
  const existing = await appStorage.getItem<AppState>('state');
  
  if (existing) {
    return existing;
  }
  
  const initial: AppState = {
    hasCompletedOnboarding: false,
    currentSpinCount: 0,
    currentTopicPack: 'default',
  };
  
  await appStorage.setItem('state', initial);
  return initial;
}
```

### Update Spin Count

```typescript
async function incrementSpinCount(): Promise<number> {
  const state = await appStorage.getItem<AppState>('state');
  const newCount = Math.min((state?.currentSpinCount ?? 0) + 1, 2);
  
  await appStorage.setItem('state', {
    ...state,
    currentSpinCount: newCount,
  });
  
  return newCount;
}

async function resetSpinCount(): Promise<void> {
  const state = await appStorage.getItem<AppState>('state');
  
  await appStorage.setItem('state', {
    ...state,
    currentSpinCount: 0,
  });
}
```

### Topic Pack Change

Per USER_FLOWS.md §5, changing packs resets spin count:

```typescript
async function changeTopicPack(packId: string): Promise<void> {
  const state = await appStorage.getItem<AppState>('state');
  
  await appStorage.setItem('state', {
    ...state,
    currentTopicPack: packId,
    currentSpinCount: 0, // Reset per USER_FLOWS.md
  });
}
```

---

## Schema Migrations

For future schema changes:

```typescript
const CURRENT_VERSION = 1;

async function migrateStoryIfNeeded(story: StoryRecord): Promise<StoryRecord> {
  if (story.version === CURRENT_VERSION) {
    return story;
  }
  
  // Future: Add migration logic
  // if (story.version === 1) {
  //   story = migrateV1ToV2(story);
  // }
  
  return story;
}
```

---

## Testing Checklist

- [ ] Save story with audio blob
- [ ] Save story with photo attachment
- [ ] Retrieve single story by ID
- [ ] List all stories sorted by date
- [ ] Delete story removes from storage
- [ ] Storage stats calculate correctly
- [ ] Handle quota exceeded error gracefully
- [ ] Handle write failure gracefully
- [ ] Re-record preserves previous take
- [ ] Spin count increments correctly
- [ ] Topic pack change resets spin count
- [ ] App state persists across sessions
- [ ] Works in Chrome, Safari, Firefox

---

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `src/storage/storyStorage.ts` | Story CRUD operations |
| `src/storage/appStorage.ts` | App state operations |
| `src/storage/types.ts` | TypeScript interfaces |
| `src/storage/errors.ts` | Custom error types |
| `src/hooks/useStories.ts` | React hook for story operations |
| `src/hooks/useAppState.ts` | React hook for app state |

---

## References

- [localforage documentation](https://localforage.github.io/localForage/)
- [IndexedDB storage limits](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Browser_storage_limits_and_eviction_criteria)
- `docs/USER_FLOWS.md` §6 (My Stories Gallery)
- `docs/USER_FLOWS.md` §9.4 (Save Failures)
- `docs/APP_SPECIFICATION.md` §3 (Story Storage)
