# Session: PWA & Offline Implementation

## Interface: Claude CLI (Claude Code)
**Why:** Requires vite.config.ts modifications, service worker setup, and testing with DevTools.

---

## Session Goal
Configure vite-plugin-pwa for offline-first operation, create PWA manifest, and ensure all core features work without network connectivity.

## Pre-Session Setup (Human)
1. Have production build ready to test (`pnpm build && pnpm preview`)
2. Browser DevTools → Application → Service Workers ready
3. Review these reference docs:
   - `docs/APP_SPECIFICATION.md` §4 (Offline Architecture)
   - `docs/USER_FLOWS.md` §9.5 (Offline Behavior)
   - `.claude/skills/story-portal/references/pwa-offline.md`
4. Prepare PWA icon assets (or plan to create them)

---

## Prompt to Start Session

```
I need to implement PWA and offline support for The Story Portal.

Reference docs:
- docs/APP_SPECIFICATION.md §4 (Offline Architecture)
- docs/USER_FLOWS.md §9.5 (Offline Behavior)
- .claude/skills/story-portal/references/pwa-offline.md (starter skill)

Current state:
- vite-plugin-pwa is NOT installed
- No service worker exists
- No PWA manifest
- App currently requires network

Requirements per spec:
- Lighthouse PWA score > 90
- All core features work offline (wheel, recording, storage, gallery)
- Installable on iOS and Android
- Prompts cached for offline use

Please implement:
1. Install and configure vite-plugin-pwa
2. Create PWA manifest with steampunk theme colors
3. Configure service worker caching strategies
4. Create/source PWA icon assets
5. Add offline detection hook
6. Test offline functionality

Start by reading the skill file and specs, then propose your implementation approach.
```

---

## Key Questions Claude Should Ask

**Assets:**
- Do PWA icons exist, or should we create placeholders?
- What should the splash screen look like?
- Is there a logo/icon asset to base icons on?

**Caching:**
- Should prompts.json use stale-while-revalidate or cache-first?
- How do we handle cache invalidation on app updates?
- Any external resources (fonts, CDN) to cache?

**Update Strategy:**
- Auto-update silently, or prompt user?
- What happens if user is mid-recording during update?

**Testing:**
- Do you have access to real iOS/Android devices?
- Should we set up Lighthouse CI for automated testing?

---

## Implementation Approach (Expected)

```
Phase 1: Plugin Setup
├── pnpm add -D vite-plugin-pwa
├── vite.config.ts modifications
│   ├── VitePWA plugin configuration
│   ├── Manifest settings
│   └── Workbox caching rules
│
Phase 2: Manifest & Icons
├── public/manifest.json (auto-generated)
├── public/pwa-192x192.png
├── public/pwa-512x512.png
├── public/apple-touch-icon.png
├── public/favicon.ico
│
Phase 3: Caching Strategies
├── App shell — Cache First
├── prompts.json — Stale While Revalidate
├── Images/assets — Cache First
├── Fonts — Cache First (long expiry)
│
Phase 4: Offline Detection
├── src/hooks/useOnlineStatus.ts
│   └── navigator.onLine + event listeners
│
Phase 5: Testing & Verification
├── Build production version
├── Test with DevTools offline mode
├── Run Lighthouse PWA audit
├── Test install on mobile
```

---

## Expected Outcomes

- [ ] vite-plugin-pwa installed and configured
- [ ] PWA manifest with correct theme colors (#1a0a00)
- [ ] All required icon sizes created
- [ ] Service worker registers correctly
- [ ] Caching strategies working per spec
- [ ] `useOnlineStatus` hook available
- [ ] Wheel spins offline
- [ ] Recording works offline
- [ ] Stories save offline
- [ ] Lighthouse PWA score > 90
- [ ] Installable on iOS Safari
- [ ] Installable on Android Chrome

---

## Testing Checklist

```
□ Service worker registers (DevTools → Application)
□ Manifest loads correctly (DevTools → Application → Manifest)
□ All icons display at correct sizes
□ Theme color matches steampunk aesthetic
□ App installs on Android Chrome
□ App adds to Home Screen on iOS Safari
□ Offline mode — wheel spins
□ Offline mode — recording works
□ Offline mode — stories save
□ Offline mode — My Stories gallery loads
□ Offline mode — content screens load
□ App update works without breaking session
□ Lighthouse PWA score > 90
□ No console errors related to service worker
```

---

## Tips for This Session

1. **Build first** — PWA only works in production build, not dev server
2. **Clear cache often** — Service worker caching can cause confusion during dev
3. **Real device testing** — Simulators don't fully replicate PWA behavior
4. **Icon generator** — Use a tool like realfavicongenerator.net
5. **Theme colors matter** — #1a0a00 (dark wood) for steampunk feel

---

## Files to Reference

| File | Why |
|------|-----|
| `docs/APP_SPECIFICATION.md` §4 | Offline architecture |
| `docs/USER_FLOWS.md` §9.5 | Offline feature matrix |
| `references/pwa-offline.md` | Technical guidance |
| `references/design-system.md` | Theme colors for manifest |
| `vite.config.ts` | Where plugin is added |

---

## PWA Manifest Reference

```json
{
  "name": "The Story Portal",
  "short_name": "Story Portal",
  "description": "Making empathy contagious through shared storytelling",
  "theme_color": "#1a0a00",
  "background_color": "#1a0a00",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "icons": [
    { "src": "pwa-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "pwa-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## Lighthouse PWA Checklist

Must pass:
- [ ] Registers a service worker
- [ ] Responds with 200 when offline
- [ ] Contains web app manifest
- [ ] Manifest has icons
- [ ] Sets a theme color
- [ ] Provides a valid apple-touch-icon
- [ ] Configured for a custom splash screen

---

## Success Criteria
Session is complete when:
1. App installs as PWA on mobile
2. All core features work offline
3. Lighthouse PWA score > 90
4. Service worker caches correctly
5. Icons display properly in all contexts
6. Theme matches steampunk aesthetic

## Next Session
→ Error States (handle all failure modes gracefully)
