# PWA & Offline — Claude Skill

**Purpose:** Guide PWA implementation for offline-first operation  
**References:** `docs/APP_SPECIFICATION.md` §4, §8, `docs/USER_FLOWS.md` §9.5

---

## Overview

The Story Portal must work at Love Burn where connectivity is unreliable. PWA enables installation, offline operation, and native-like experience.

### Design Principles

| Principle | Implication |
|-----------|-------------|
| Offline-first | Core features work without network |
| Installable | Feels like a native app |
| Fast | App shell loads instantly from cache |
| Resilient | Graceful degradation, not errors |

---

## Dependencies

```bash
pnpm add -D vite-plugin-pwa
```

---

## Vite PWA Configuration

### Basic Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'The Story Portal',
        short_name: 'Story Portal',
        description: 'Making empathy contagious through shared storytelling',
        theme_color: '#1a0a00',
        background_color: '#1a0a00',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // See Caching Strategies below
      },
    }),
  ],
});
```

### Manifest Colors

Match steampunk aesthetic:

| Property | Value | Notes |
|----------|-------|-------|
| theme_color | `#1a0a00` | Dark wood/leather |
| background_color | `#1a0a00` | Matches app background |

---

## Caching Strategies

### App Shell (Cache First)

Static assets that rarely change:

```typescript
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
}
```

### Prompts Data (Stale While Revalidate)

Prompts.json should be available offline but update when possible:

```typescript
{
  urlPattern: /\/prompts\.json$/,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'prompts-cache',
    expiration: {
      maxEntries: 1,
      maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
    },
  },
}
```

### Images/Assets (Cache First)

```typescript
{
  urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  handler: 'CacheFirst',
  options: {
    cacheName: 'images-cache',
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
    },
  },
}
```

---

## Offline Feature Matrix

Per USER_FLOWS.md §9.5:

| Feature | Offline Behavior | Implementation |
|---------|------------------|----------------|
| Wheel spin | ✅ Works | Prompts cached locally |
| Recording | ✅ Works | MediaRecorder is local |
| Save | ✅ Works | IndexedDB (localforage) |
| My Stories | ✅ Works | Local data |
| Content screens | ✅ Works | Cached in service worker |
| Cloud sync | ⏸️ Deferred | Phase 2 feature |

---

## Offline Detection

### Hook Implementation

```typescript
import { useState, useEffect } from 'react';

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### UI Indication (Optional)

For MVP, offline should be invisible—everything just works. Future: subtle indicator if needed for sync features.

---

## Service Worker Registration

### Auto-Registration

vite-plugin-pwa handles registration automatically with `registerType: 'autoUpdate'`.

### Update Prompt (Optional)

For smoother updates:

```typescript
// src/main.tsx
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // New version available
    // For MVP: Auto-update silently
    updateSW(true);
    
    // Future: Show "Update available" prompt
  },
  onOfflineReady() {
    console.log('App ready for offline use');
  },
});
```

---

## Install Prompt

### Capture Install Event

```typescript
let deferredPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show custom install button if desired
});

async function installApp() {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    // Track install in analytics
  }
  
  deferredPrompt = null;
}
```

### Install UI (Optional for MVP)

Could add subtle install prompt in menu or after first story saved. Not critical for Love Burn.

---

## Required Assets

Create these icons in `public/`:

| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 32x32 | Browser tab |
| `apple-touch-icon.png` | 180x180 | iOS home screen |
| `pwa-192x192.png` | 192x192 | Android install |
| `pwa-512x512.png` | 512x512 | Splash screen |
| `mask-icon.svg` | any | Safari pinned tab |

### Icon Design Notes

- Use Story Portal logo/branding
- Solid background (no transparency for PWA icons)
- Match theme_color for consistent splash

---

## Testing Offline

### Chrome DevTools

1. Open DevTools → Application tab
2. Service Workers panel → Check "Offline"
3. Verify app still works

### Lighthouse PWA Audit

```bash
# Build production version
pnpm build

# Serve locally
pnpm preview

# Run Lighthouse in Chrome DevTools
# Check PWA score (target: >90)
```

### Real-World Testing

1. Load app while online
2. Enable airplane mode
3. Force-close and reopen app
4. Verify: Wheel spins, can record, can view stories

---

## Testing Checklist

- [ ] App installs on Android Chrome
- [ ] App installs on iOS Safari (Add to Home Screen)
- [ ] App loads offline after first visit
- [ ] Wheel spins offline
- [ ] Recording works offline
- [ ] Stories save offline
- [ ] My Stories gallery loads offline
- [ ] Content screens load offline
- [ ] Service worker updates without breaking app
- [ ] Lighthouse PWA score > 90
- [ ] Icons display correctly in all contexts

---

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `vite.config.ts` | Add VitePWA plugin |
| `public/manifest.json` | Auto-generated, but verify |
| `public/pwa-*.png` | PWA icons |
| `public/apple-touch-icon.png` | iOS icon |
| `public/favicon.ico` | Browser tab icon |
| `src/hooks/useOnlineStatus.ts` | Online/offline detection |

---

## Common Issues

### "Site cannot be installed"

- Check HTTPS (required for PWA)
- Verify manifest.json is valid
- Check icons exist and are correct sizes

### Service Worker Not Updating

- Check `registerType: 'autoUpdate'` in config
- Clear browser cache during development
- Use `skipWaiting()` if needed

### Offline Not Working

- Verify service worker is registered (DevTools → Application)
- Check that all critical assets are in globPatterns
- Ensure dynamic routes are handled

---

## References

- [vite-plugin-pwa documentation](https://vite-pwa-org.netlify.app/)
- [Workbox documentation](https://developer.chrome.com/docs/workbox/)
- [PWA checklist](https://web.dev/pwa-checklist/)
- `docs/APP_SPECIFICATION.md` §4 (Offline Architecture)
- `docs/APP_SPECIFICATION.md` §8 (Lighthouse PWA score > 90)
