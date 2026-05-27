# OpportunityIQ — Mobile App Setup Guide

OpportunityIQ is available as:
1. **PWA (Progressive Web App)** — installable from any browser, works on iOS & Android immediately
2. **Native Android APK** — via Capacitor + Android Studio
3. **Native iOS App** — via Capacitor + Xcode (Mac required)

---

## Option 1 — Install as PWA (Easiest — No App Store needed)

### Android (Chrome)
1. Open Chrome and navigate to the app URL
2. Tap the **three-dot menu** → **"Add to Home screen"**
3. Tap **"Add"** — the app icon appears on your home screen
4. Launch from home screen — runs in full-screen standalone mode ✅

### iPhone / iPad (Safari)
1. Open **Safari** and navigate to the app URL
2. Tap the **Share button** (□↑)
3. Scroll down → tap **"Add to Home Screen"**
4. Tap **"Add"** — the app icon appears on your home screen ✅

### Features when installed as PWA
- ✅ Works offline (cached pages)
- ✅ Full-screen, no browser chrome
- ✅ Push notifications (Android)
- ✅ Home screen icon with splash screen
- ✅ Shortcuts (Dashboard, Jobs, Interview Prep)

---

## Option 2 — Native Android App (APK / Play Store)

### Prerequisites
- Node.js 18+
- Android Studio (with Android SDK)
- Java 17+

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/manojkumar190488-pixel/holy-child-school
cd holy-child-school/frontend

# 2. Install dependencies
npm install

# 3. Build the Next.js app as static export
npm run build

# 4. If next build doesn't create 'out/', add to next.config.js:
#    output: 'export'
# Then rebuild: npm run build

# 5. Add Android platform
npx cap add android

# 6. Sync web assets into native project
npx cap sync android

# 7. Open in Android Studio
npx cap open android

# 8. In Android Studio: Build → Generate Signed Bundle/APK
```

### Run on connected Android device
```bash
npx cap run android
```

---

## Option 3 — Native iOS App (Mac + Xcode required)

### Prerequisites
- Mac with macOS 13+
- Xcode 15+
- Apple Developer Account (for device testing / App Store)
- CocoaPods: `sudo gem install cocoapods`

### Steps

```bash
# 1. Build static export
npm run build

# 2. Add iOS platform
npx cap add ios

# 3. Sync
npx cap sync ios

# 4. Open in Xcode
npx cap open ios

# 5. In Xcode: Select your team, set Bundle ID to ai.opportunityiq.app
# 6. Product → Run (on simulator or device)
```

---

## Development with Live Reload on Device

Edit `capacitor.config.ts` and uncomment the server URL:

```typescript
server: {
  url: 'http://YOUR_LOCAL_IP:3000',  // e.g. 192.168.1.5:3000
  cleartext: true,
}
```

Then:
```bash
npm run dev                    # Start Next.js dev server
npx cap run android --livereload   # Deploy to Android with live reload
npx cap run ios --livereload       # Deploy to iOS with live reload
```

---

## Project Structure (Mobile-relevant files)

```
frontend/
├── capacitor.config.ts        # Capacitor native config
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker (auto-generated)
│   ├── sw-custom.js           # Custom SW (push notifications, sync)
│   └── icons/                 # App icons (all sizes)
├── app/
│   ├── layout.tsx             # PWA meta tags, theme-color, manifest link
│   └── offline/page.tsx       # Offline fallback page
└── components/layout/
    └── MobileNav.tsx          # Bottom tab navigation (mobile only)
```

---

## Push Notifications Setup

### Android (Firebase Cloud Messaging)
1. Create a Firebase project at console.firebase.google.com
2. Add Android app with package ID: `ai.opportunityiq.app`
3. Download `google-services.json` → place in `android/app/`
4. Install plugin: `npm install @capacitor/push-notifications`
5. Sync: `npx cap sync`

### iOS (Apple Push Notification Service)
1. Enable Push Notifications capability in Xcode
2. Generate APNs certificate in Apple Developer portal
3. Upload to Firebase or your backend
4. Same plugin handles both platforms

---

## App Store Submission Checklist

- [ ] Update `capacitor.config.ts` — remove dev server URL
- [ ] Set version in `android/app/build.gradle` and `ios/App/App.xcodeproj`
- [ ] Add real screenshots (1242×2688 for iPhone, 2048×2732 for iPad)
- [ ] Write App Store description
- [ ] Generate signed APK/AAB (Android) or Archive (iOS)
- [ ] Submit via Google Play Console / App Store Connect

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web Framework | Next.js 14 (App Router) |
| PWA | next-pwa 5.6 + Web App Manifest |
| Native Bridge | Capacitor 8 |
| UI | Tailwind CSS + Framer Motion |
| Charts | Recharts |
| State | TanStack Query |
