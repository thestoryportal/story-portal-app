# Session: Local Storage Implementation

## Interface: Claude CLI (Claude Code)
**Why:** Direct implementation with package installation, TypeScript interfaces, and testing against IndexedDB.

---

## Session Goal
Implement story persistence using localforage, including data schema, CRUD operations, app state management, and error handling.

## Pre-Session Setup (Human)
1. Ensure dev server is running (`pnpm dev`)
2. Have browser DevTools → Application → IndexedDB ready
3. Review these reference docs:
   - `docs/USER_FLOWS.md` §6 (My Stories Gallery)
   - `docs/USER_FLOWS.md` §9.4 (Save Failures)
   - `.claude/skills/story-portal/references/local-storage.md`
4. Audio recording should be implemented (or use test blobs)

---

## Prompt to Start Session

```
I need to implement local storage for The Story Portal using localforage.

Reference docs:
- docs/USER_FLOWS.md §6 (My Stories Gallery), §9.4 (Save Failures)
- .claude/skills/story-portal/references/local-storage.md (starter skill)

Current state:
- localforage is NOT installed yet
- StoriesView.tsx exists as placeholder
- No storage code exists

Requirements per spec:
- Stories stored in IndexedDB via localforage
- Each story: audio blob, prompt, timestamp, duration, consent, optional photo
- Re-record must preserve previous take until new save
- Handle quota exceeded errors gracefully
- Track app state (spin count, topic pack, onboarding)

Please implement:
1. Install localforage
2. Create TypeScript interfaces for StoryRecord, ConsentMetadata, AppState
3. Create storyStorage module (save, get, getAll, delete)
4. Create appStorage module (spin count, topic pack, onboarding state)
5. Create React hooks for easy component integration
6. Error handling for storage failures

Start by reading the skill file and USER_FLOWS.md, then propose your implementation approach.
```

---

## Key Questions Claude Should Ask

**Schema Design:**
- Should we store the full prompt object or just prompt ID?
- How do we handle schema migrations when adding fields later?
- Should consent metadata be flattened or nested?

**Re-record Safety:**
- Where is the "previous take" held during re-record? (Memory? Temp storage?)
- How long do we keep it before cleanup?

**App State:**
- Should spin count reset on app close, or persist?
- How do we handle topic pack state across sessions?

**Error Handling:**
- What's the retry UX for failed saves?
- Should we show storage usage stats to user?

**Performance:**
- How many stories before we need pagination in gallery?
- Should we lazy-load audio blobs or include in list query?

---

## Implementation Approach (Expected)

```
Phase 1: Setup & Types
├── pnpm add localforage
├── src/storage/types.ts
│   ├── StoryRecord interface
│   ├── ConsentMetadata interface
│   └── AppState interface
│
Phase 2: Storage Modules
├── src/storage/config.ts
│   └── localforage instance configuration
├── src/storage/storyStorage.ts
│   ├── saveStory(story)
│   ├── getStory(id)
│   ├── getAllStories()
│   ├── deleteStory(id)
│   └── getStorageStats()
├── src/storage/appStorage.ts
│   ├── getAppState()
│   ├── setSpinCount(n)
│   ├── setTopicPack(id)
│   └── setOnboardingComplete()
│
Phase 3: Error Handling
├── src/storage/errors.ts
│   ├── StorageFullError
│   └── StorageWriteError
│
Phase 4: React Hooks
├── src/hooks/useStories.ts
│   ├── stories, loading, error state
│   ├── saveStory, deleteStory actions
│   └── Handles re-record safety
├── src/hooks/useAppState.ts
│   └── spinCount, topicPack, canPass
```

---

## Expected Outcomes

- [ ] localforage installed and configured
- [ ] TypeScript interfaces matching USER_FLOWS.md schema
- [ ] storyStorage module with full CRUD
- [ ] appStorage module for spin count, topic pack, onboarding
- [ ] Custom error types for storage failures
- [ ] useStories hook for component integration
- [ ] useAppState hook for spin/pass logic
- [ ] Re-record preserves previous take correctly
- [ ] Quota exceeded handled gracefully
- [ ] Storage visible in DevTools → IndexedDB

---

## Testing Checklist

```
□ Save story — appears in IndexedDB
□ Get story by ID — returns correct data
□ Get all stories — returns sorted by date (newest first)
□ Delete story — removes from IndexedDB
□ Save with photo — blob stored correctly
□ Re-record — previous take preserved until new save
□ Quota exceeded — friendly error shown
□ Write failure — retry option works
□ Spin count — increments correctly (1 → 2)
□ Spin count — resets on topic pack change
□ Topic pack — persists across sessions
□ Onboarding — only shows once
```

---

## Tips for This Session

1. **Install first** — Run `pnpm add localforage` before writing code
2. **Check DevTools** — Verify data actually appears in IndexedDB
3. **Test with blobs** — Create test audio blobs if recording not ready
4. **Schema versioning** — Include version field now for future migrations
5. **Error boundaries** — Storage errors shouldn't crash the app

---

## Files to Reference

| File | Why |
|------|-----|
| `docs/USER_FLOWS.md` | Data model, error states |
| `references/local-storage.md` | Technical guidance |
| `src/legacy/views/StoriesView.tsx` | Current placeholder |

---

## Data Model Reference

```typescript
interface StoryRecord {
  id: string;                    // UUID v4
  version: 1;                    // Schema version
  audioBlob: Blob;
  prompt: {
    id: number;
    text: string;
    category: string;
  };
  photo?: Blob;
  timestamp: string;             // ISO 8601
  duration: number;              // Seconds
  consent: ConsentMetadata;
}

interface ConsentMetadata {
  type: 'self' | 'other';
  tapConsentTimestamp?: string;
  verbalConsentInAudio: boolean;
  storytellerEmail?: string;
  storytellerName?: string;
}

interface AppState {
  hasCompletedOnboarding: boolean;
  currentSpinCount: number;      // 0, 1, or 2
  currentTopicPack: string;
}
```

---

## Success Criteria
Session is complete when:
1. Can save a story with audio blob and retrieve it
2. Stories list shows all saved stories
3. Delete removes story permanently
4. Spin count logic works per USER_FLOWS.md
5. Quota exceeded shows friendly error
6. Data persists across browser refresh

## Next Session
→ My Stories Gallery UI (display saved stories)
