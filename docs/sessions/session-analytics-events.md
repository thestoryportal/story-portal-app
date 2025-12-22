# Session: Analytics Implementation

## Interface: Claude CLI (Claude Code)
**Why:** Code implementation with TypeScript types, needs testing with GA4 DebugView.

---

## Session Goal
Implement GA4 analytics tracking for all key events defined in the spec, with proper TypeScript types and testing verification.

## Pre-Session Setup (Human)
1. Create GA4 property if not exists (Google Analytics)
2. Get Measurement ID (G-XXXXXXXXXX)
3. Have GA4 DebugView ready for testing
4. Review these reference docs:
   - `docs/APP_SPECIFICATION.md` §7 (Success Metrics)
   - `.claude/skills/story-portal/references/analytics-events.md`
5. Install Google Analytics Debugger Chrome extension

---

## Prompt to Start Session

```
I need to implement GA4 analytics for The Story Portal.

Reference docs:
- docs/APP_SPECIFICATION.md §7 (Success Metrics)
- .claude/skills/story-portal/references/analytics-events.md (starter skill)

Current state:
- No analytics implemented
- No gtag script in index.html

GA4 Measurement ID: [YOUR_ID_HERE]

Required events per spec:
- wheel_spin (spin initiated)
- prompt_landed (wheel stops)
- prompt_pass (pass button tapped)
- recording_start (recording begins)
- recording_complete (recording stops)
- story_saved (save successful)
- topic_pack_changed (pack switched)

Please implement:
1. Add GA4 script to index.html
2. Create TypeScript event interfaces
3. Create trackEvent wrapper function
4. Add event calls to appropriate components
5. Verify events appear in GA4 DebugView

Start by reading the skill file and spec, then propose your implementation approach.
```

---

## Key Questions Claude Should Ask

**Setup:**
- Do you have the GA4 Measurement ID?
- Is this a new property or existing?
- Any existing analytics to preserve?

**Events:**
- Should we add app_open event for session tracking?
- Track recording_abandoned when started but not saved?
- Any custom dimensions to configure in GA4?

**Privacy:**
- Cookie consent required for your jurisdiction?
- Should we add analytics opt-out (Phase 2)?
- Any PII concerns with current event properties?

**Testing:**
- Can you access GA4 DebugView?
- Do you have the Chrome debugger extension?
- Test in production build or dev?

---

## Implementation Approach (Expected)

```
Phase 1: Setup
├── Add GA4 script to index.html
├── src/analytics/gtag.ts
│   └── Type declarations for gtag
│
Phase 2: Types & Wrapper
├── src/analytics/types.ts
│   ├── WheelSpinEvent
│   ├── PromptLandedEvent
│   ├── PromptPassEvent
│   ├── RecordingStartEvent
│   ├── RecordingCompleteEvent
│   ├── StorySavedEvent
│   └── TopicPackChangedEvent
├── src/analytics/events.ts
│   └── trackEvent(event) wrapper
│
Phase 3: Integration
├── Wheel component → wheel_spin, prompt_landed
├── Pass button → prompt_pass
├── Recording start → recording_start
├── Recording stop → recording_complete
├── Story save → story_saved
├── Topic picker → topic_pack_changed
│
Phase 4: Testing
├── Enable debug mode
├── Verify each event in DebugView
├── Check event properties are correct
```

---

## Expected Outcomes

- [ ] GA4 script added to index.html
- [ ] TypeScript interfaces for all events
- [ ] `trackEvent` wrapper function
- [ ] All 7 required events implemented
- [ ] Events fire at correct moments
- [ ] Event properties are accurate
- [ ] Console logging in development
- [ ] All events visible in GA4 DebugView
- [ ] No PII in any event

---

## Testing Checklist

```
□ GA4 script loads (check Network tab)
□ wheel_spin — fires on spin initiation
□ wheel_spin — includes spin_number (1 or 2)
□ wheel_spin — includes topic_pack
□ prompt_landed — fires when wheel stops
□ prompt_landed — includes prompt_id, category, declaration_risk
□ prompt_pass — fires on pass button tap
□ prompt_pass — only possible on spin_number: 1
□ recording_start — fires when MediaRecorder starts
□ recording_start — includes consent_type (self/other)
□ recording_complete — fires when recording stops
□ recording_complete — includes duration_seconds
□ story_saved — fires on successful localforage save
□ story_saved — includes has_photo boolean
□ topic_pack_changed — fires on pack switch
□ topic_pack_changed — includes from_pack and to_pack
□ All events visible in GA4 DebugView
□ No console errors
□ Works in production build
```

---

## Tips for This Session

1. **Measurement ID first** — Nothing works without it
2. **Debug mode** — Use Chrome extension for real-time verification
3. **Console log in dev** — Makes debugging easier
4. **Check property types** — GA4 is picky about data types
5. **Test production build** — Some issues only appear in prod

---

## Files to Reference

| File | Why |
|------|-----|
| `docs/APP_SPECIFICATION.md` §7 | Event list and metrics |
| `references/analytics-events.md` | Event schemas |
| `docs/USER_FLOWS.md` | When events should fire |
| `index.html` | Where GA4 script goes |

---

## Event Properties Reference

```typescript
// wheel_spin
{ spin_number: 1 | 2, topic_pack: string }

// prompt_landed
{ prompt_id: number, prompt_category: string, declaration_risk: boolean }

// prompt_pass
{ prompt_id: number, spin_number: 1 }

// recording_start
{ prompt_id: number, consent_type: 'self' | 'other' }

// recording_complete
{ prompt_id: number, duration_seconds: number, consent_type: 'self' | 'other' }

// story_saved
{ prompt_id: number, duration_seconds: number, has_photo: boolean, consent_type: 'self' | 'other' }

// topic_pack_changed
{ from_pack: string, to_pack: string }
```

---

## GA4 Setup Reference

**index.html addition:**
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Event call pattern:**
```typescript
gtag('event', 'wheel_spin', {
  spin_number: 1,
  topic_pack: 'default'
});
```

---

## Funnel to Verify

Once all events are in place, verify this funnel works in GA4:

```
wheel_spin (spin_number: 1)
    ↓ [some may pass]
prompt_pass
    ↓
wheel_spin (spin_number: 2)
    ↓
prompt_landed
    ↓ [conversion point]
recording_start
    ↓
recording_complete
    ↓
story_saved
```

---

## Success Criteria
Session is complete when:
1. GA4 script loads without errors
2. All 7 events fire at correct moments
3. Event properties are accurate
4. Events visible in GA4 DebugView
5. Console logging works in development
6. No PII in any event data

## Next Session
→ GA4 Dashboard Setup (configure reports and funnels)
