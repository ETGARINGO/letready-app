# LETReady 2.0

An offline-first LET (Licensure Examination for Teachers) review app. It runs as a website, installs as a PWA, and wraps into a real Android or iOS app with Capacitor — from the same `www/` folder.

Everything a user creates (account, answers, streaks, bookmarks) is stored on their own device. There is no backend to set up and nothing leaves the phone.

---

## Run it

```bash
npm install          # only needed for the Capacitor/serve tooling
npm start            # serves www/ at http://localhost:5173
```

Or open `www/index.html` directly in a browser. Service workers and SHA-256 hashing need `http://localhost` or HTTPS; on `file://` the app still works and falls back to a simpler hash.

## Deploy as a website / PWA

Upload the **contents of `www/`** to any static host. No build step.

| Host | What to do |
|---|---|
| Netlify | Drag the `www` folder into the deploy box. `_redirects` is already included. |
| Vercel | `vercel --prod` from the project root (`vercel.json` points at `www`). |
| GitHub Pages | Push `www/` to the `gh-pages` branch, or set Pages to serve `/www`. |
| Firebase Hosting | `firebase init hosting` and set the public directory to `www`. |

Once it is on HTTPS, users get the “Install” banner and the app works with no connection.

## Build the Android app

```bash
npm install
npx cap add android
npx cap sync
npx cap open android        # opens Android Studio
```

In Android Studio: **Build → Build Bundle(s)/APK(s) → Build APK(s)** for testing, or **Generate Signed Bundle** for the Play Store.

For a command-line debug APK:

```bash
npm run build:apk
# android/app/build/outputs/apk/debug/app-debug.apk
```

App icons: copy `www/icons/icon-512.png` into Android Studio's **Image Asset** tool, or drop `www/icons/splash.png` into `android/app/src/main/res/drawable/`.

## Build the iOS app

Requires macOS with Xcode.

```bash
npx cap add ios
npx cap sync
npx cap open ios
```

Set your team and bundle identifier in Xcode, then Run or Archive.

After any change to files in `www/`, run `npx cap sync` again.

---

## What is in the app

**Accounts**
Sign up, sign in, or continue as a guest. Passwords are salted and hashed with SHA-256 through the Web Crypto API; the plain password is never stored. Each account keeps its own progress, and you can switch between accounts on one device.

**Onboarding**
Three steps: track (Elementary or Secondary plus major), exam date, daily goal. All of it is editable later in Settings.

**Home**
Readiness score that blends accuracy, how much of the bank you have seen, and streak consistency. Exam countdown with a suggested daily pace, today's goal, a single “do this next” recommendation, and per-subject performance.

**Review**
Topic list per subject with mastery percentages, searchable. Each topic opens concept notes and a one-tap drill. Flashcard deck with a flip animation and shuffle.

**Practice** — eight session types
Quick practice, Smart review (Leitner spaced repetition), Weak topics, Question bank with filters, timed Practice test, full Mock LET, Mistake drill, and Bookmarked items. Every session lets you set count, time limit, difficulty, and whether the answer shows immediately or only at the end.

**During a session**
Progress bar, countdown that turns red in the last minute, instant colour feedback, explanation for every item, bookmarking, keyboard shortcuts (1–4 to answer, arrows to move), vibration feedback.

**Results**
Score, correct/missed, time used, and a tappable answer sheet that reopens any item with its explanation.

**Progress**
Seven-day bar chart, fourteen-day accuracy sparkline, per-subject bars, topic mastery split into strong / developing / needs work, a full weakest-first topic table, longest streak, and bank coverage.

**Everything else**
Three themes (dark, light, soft/neumorphic), offline indicator, install prompt, JSON export and restore, clear progress, delete account.

---

## Add your own questions

Open `www/js/data.js`. One question looks like this:

```js
{ id: "pe21", subject: "profed", topic: "Assessment of Learning", difficulty: "Medium",
  question: "…",
  choices: ["A", "B", "C", "D"],
  answer: 1,                 // zero-based index of the correct choice
  explanation: "Why that answer is right." }
```

- `subject` must be `gened`, `profed` or `major`.
- `topic` must appear in the `TOPICS` list for that subject.
- `id` must be unique — progress and bookmarks are keyed to it.

`LESSONS` holds the notes shown in Review, keyed by topic. `FLASHCARDS` holds the card deck. `MAJORS` and `TRACKS` drive onboarding.

After editing, bump `CACHE` in `www/service-worker.js` so returning users get the new content instead of the cached copy.

## Project layout

```
letready-app/
├── package.json            scripts + Capacitor dependencies
├── capacitor.config.json   native app id, name, splash, status bar
├── vercel.json             static hosting config
├── README.md
└── www/                    ← the entire app; this is what you deploy
    ├── index.html
    ├── manifest.webmanifest
    ├── service-worker.js
    ├── _redirects
    ├── css/styles.css
    ├── js/data.js          questions, lessons, flashcards
    ├── js/store.js         device storage + accounts
    ├── js/app.js           all app logic
    └── icons/              192, 512, maskable, apple-touch, splash
```

## Notes before you ship

- The included bank is a working sample of 48 items. Replace it with your own licensed content before publishing.
- Storage is local, so clearing browser data erases progress. Tell users to export a JSON backup before reinstalling.
- If you later add a server, `js/store.js` is the only file that has to change.

MIT licensed.
