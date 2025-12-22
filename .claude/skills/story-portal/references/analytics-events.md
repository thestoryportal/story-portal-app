# Analytics Events — Claude Skill

**Purpose:** Guide GA4 implementation for tracking success metrics  
**References:** `docs/APP_SPECIFICATION.md` §7, `docs/USER_FLOWS.md`

---

## Overview

Analytics help us understand if The Story Portal is achieving its mission. We track behavior, not content—we never record or analyze what people say in their stories.

### North Star Metric

**Stories Shared Per Active User** — Target: 3+ in first 30 days

### Key Questions Analytics Should Answer

1. Are people spinning the wheel? (Activation)
2. Are they telling stories? (Engagement)
3. Are they coming back? (Retention)
4. Where do they drop off? (Funnel analysis)

---

## Event Inventory

Per APP_SPECIFICATION.md §7:

| Event | Trigger | Properties |
|-------|---------|------------|
| `wheel_spin` | Spin initiated | `spin_number`, `topic_pack` |
| `prompt_landed` | Wheel stops on prompt | `prompt_id`, `prompt_category`, `declaration_risk` |
| `prompt_pass` | Pass button tapped | `prompt_id`, `spin_number` |
| `recording_start` | Recording begins | `prompt_id`, `consent_type` |
| `recording_complete` | Recording stops | `prompt_id`, `duration_seconds`, `consent_type` |
| `story_saved` | Save successful | `prompt_id`, `duration_seconds`, `has_photo`, `consent_type` |
| `topic_pack_changed` | Pack switched | `from_pack`, `to_pack` |

### Additional Events (Recommended)

| Event | Trigger | Properties |
|-------|---------|------------|
| `app_open` | App launched | `is_first_launch`, `is_installed_pwa` |
| `onboarding_complete` | First spin | — |
| `recording_abandoned` | Recording started but not saved | `prompt_id`, `duration_seconds`, `reason` |
| `story_played` | Playback started in My Stories | `story_id`, `duration_seconds` |
| `story_deleted` | Story deleted | `story_id`, `duration_seconds` |
| `consent_completed` | Consent flow finished | `consent_type`, `email_provided` |
| `error_occurred` | Error shown to user | `error_type`, `context` |

---

## Event Schemas

### wheel_spin

```typescript
interface WheelSpinEvent {
  event: 'wheel_spin';
  params: {
    spin_number: 1 | 2;           // 1st or 2nd spin
    topic_pack: string;           // Pack ID (e.g., "default", "love-burn-2025")
  };
}
```

**When to fire:** Immediately when spin is initiated (tap/swipe), not when wheel stops.

### prompt_landed

```typescript
interface PromptLandedEvent {
  event: 'prompt_landed';
  params: {
    prompt_id: number;            // From prompts.json
    prompt_category: string;      // Category ID
    declaration_risk: boolean;    // Whether hint cycling is needed
  };
}
```

**When to fire:** When wheel stops and prompt is revealed.

### prompt_pass

```typescript
interface PromptPassEvent {
  event: 'prompt_pass';
  params: {
    prompt_id: number;
    spin_number: 1;               // Always 1 (can't pass on 2nd)
  };
}
```

**When to fire:** When Pass button is tapped.

### recording_start

```typescript
interface RecordingStartEvent {
  event: 'recording_start';
  params: {
    prompt_id: number;
    consent_type: 'self' | 'other';
  };
}
```

**When to fire:** When MediaRecorder.start() is called.

### recording_complete

```typescript
interface RecordingCompleteEvent {
  event: 'recording_complete';
  params: {
    prompt_id: number;
    duration_seconds: number;     // Rounded to nearest second
    consent_type: 'self' | 'other';
  };
}
```

**When to fire:** When recording stops (user tap or 5-min limit).

### story_saved

```typescript
interface StorySavedEvent {
  event: 'story_saved';
  params: {
    prompt_id: number;
    duration_seconds: number;
    has_photo: boolean;
    consent_type: 'self' | 'other';
  };
}
```

**When to fire:** When localforage.setItem() succeeds.

### topic_pack_changed

```typescript
interface TopicPackChangedEvent {
  event: 'topic_pack_changed';
  params: {
    from_pack: string;
    to_pack: string;
  };
}
```

**When to fire:** When user confirms pack change.

---

## Implementation

### GA4 Setup

```typescript
// src/analytics/gtag.ts

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize (in index.html or main.tsx)
// <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>

window.dataLayer = window.dataLayer || [];
function gtag(...args: any[]) {
  window.dataLayer.push(args);
}
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX');
```

### Event Wrapper

```typescript
// src/analytics/events.ts

type AnalyticsEvent = 
  | WheelSpinEvent
  | PromptLandedEvent
  | PromptPassEvent
  | RecordingStartEvent
  | RecordingCompleteEvent
  | StorySavedEvent
  | TopicPackChangedEvent;

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window.gtag !== 'function') {
    console.warn('GA4 not loaded, event not tracked:', event);
    return;
  }

  window.gtag('event', event.event, event.params);
}
```

### Usage in Components

```typescript
// In wheel component
import { trackEvent } from '../analytics/events';

function handleSpin() {
  trackEvent({
    event: 'wheel_spin',
    params: {
      spin_number: spinCount + 1,
      topic_pack: currentPack,
    },
  });
  
  // ... actual spin logic
}
```

### TypeScript Types

```typescript
// src/analytics/types.ts

export interface WheelSpinEvent {
  event: 'wheel_spin';
  params: {
    spin_number: 1 | 2;
    topic_pack: string;
  };
}

export interface PromptLandedEvent {
  event: 'prompt_landed';
  params: {
    prompt_id: number;
    prompt_category: string;
    declaration_risk: boolean;
  };
}

// ... etc for all events
```

---

## Funnel Analysis

### Core Funnel

```
app_open
    ↓
wheel_spin (spin_number: 1)
    ↓
prompt_landed
    ↓ (optional pass)
wheel_spin (spin_number: 2)
    ↓
prompt_landed (final)
    ↓
recording_start (conversion point)
    ↓
recording_complete
    ↓
story_saved
```

### Key Conversion Rates

| Metric | Calculation | Target |
|--------|-------------|--------|
| Spin rate | `wheel_spin` / `app_open` | >80% |
| Pass rate | `prompt_pass` / `prompt_landed` | <30% |
| Record rate | `recording_start` / `prompt_landed` | >50% |
| Completion rate | `story_saved` / `recording_start` | >80% |

---

## Privacy Considerations

### What We Track

- Event names and timestamps
- Prompt IDs and categories
- Duration (rounded)
- Consent type
- Topic pack selections

### What We NEVER Track

- Audio content
- Transcriptions
- User identity (no user ID in MVP)
- Email addresses (stored locally, not sent to analytics)
- Location
- Device identifiers

### Consent for Analytics

GA4 tracking is separate from story consent. Consider:
- Cookie consent banner (if required by jurisdiction)
- Analytics opt-out in settings (Phase 2)

For MVP at Love Burn (US-based event), basic GA4 without explicit consent is acceptable.

---

## GA4 Custom Dimensions

To enable better analysis, configure custom dimensions in GA4:

| Dimension | Scope | Maps to |
|-----------|-------|---------|
| `prompt_category` | Event | prompt_category param |
| `topic_pack` | Event | topic_pack param |
| `consent_type` | Event | consent_type param |
| `declaration_risk` | Event | declaration_risk param |

---

## Debugging

### GA4 DebugView

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) extension
2. Enable debug mode
3. Open GA4 → Configure → DebugView
4. Perform actions in app, verify events appear

### Console Logging (Development)

```typescript
export function trackEvent(event: AnalyticsEvent): void {
  if (import.meta.env.DEV) {
    console.log('[Analytics]', event.event, event.params);
  }

  if (typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', event.event, event.params);
}
```

---

## Testing Checklist

- [ ] `wheel_spin` fires on spin initiation
- [ ] `prompt_landed` fires when wheel stops
- [ ] `prompt_pass` fires on pass (only on 1st spin)
- [ ] `recording_start` fires when recording begins
- [ ] `recording_complete` fires when recording stops
- [ ] `story_saved` fires on successful save
- [ ] `topic_pack_changed` fires on pack switch
- [ ] All events have correct properties
- [ ] Events appear in GA4 DebugView
- [ ] No PII in any event properties
- [ ] Analytics don't break offline mode

---

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `src/analytics/gtag.ts` | GA4 initialization |
| `src/analytics/events.ts` | Event tracking functions |
| `src/analytics/types.ts` | TypeScript event interfaces |
| `index.html` | GA4 script tag |

---

## GA4 Configuration Reference

### Measurement ID

Get from: GA4 → Admin → Data Streams → Web → Measurement ID

Format: `G-XXXXXXXXXX`

### Recommended GA4 Settings

| Setting | Value |
|---------|-------|
| Data retention | 14 months |
| Google signals | Disabled (privacy) |
| Granular location | Disabled (privacy) |
| User-ID | Not implemented (MVP) |

---

## References

- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [GA4 Custom Dimensions](https://support.google.com/analytics/answer/10075209)
- `docs/APP_SPECIFICATION.md` §7 (Success Metrics)
- `docs/USER_FLOWS.md` (Event trigger points in diagrams)
