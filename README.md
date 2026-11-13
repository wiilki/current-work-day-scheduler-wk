# Daymark — Daily Work Planner

A redesigned, dependency-free daily work scheduler that runs entirely in your browser. Daymark is a modern replacement for the original **Current Work Day Scheduler** bootcamp project.

## Open the planner

**Live site (GitHub Pages):** https://wiilki.github.io/current-work-day-scheduler-wk/

If Pages has not been enabled yet, choose **Settings → Pages → Build and deployment → Deploy from a branch → main / (root)** in this repository.

You can also open `index.html` directly in a modern browser. No server, account, or API key is required.

## Features

- **Hourly time blocks** with live past / current / future indicators, refreshed every 30 seconds.
- **Reliable save buttons** on every block, plus auto-save while you type, on blur, and on page exit.
- **Dates are independent**: switch days with the arrows, week picker, or native calendar.
- **Local persistence**: plans, one top priority, and daily notes are stored per date in `localStorage`.
- **Adjustable work hours** (6 AM–12 PM start and 1 PM–10 PM end). Hidden hours remain stored.
- **Planning overview** showing filled and free hours.
- **Export** the selected day to a plain text file.
- **Clear one block** or an entire day with an undo action.
- **Legacy migration**: imports old `current-tasks` entries into the corresponding 9 AM–5 PM hours the first time you open today's planner.
- **Responsive and keyboard friendly** without Bootstrap, jQuery, Day.js, or external font/CDN dependencies.

### Where are my entries saved?

Only in the browser and device where you entered them. Changing devices, clearing browser storage, or opening a private browsing session will not sync your plans. Use **Export** to keep a text copy. If your browser blocks storage or reaches its storage limit, Daymark will show an error rather than pretend the changes saved.

### Keyboard shortcut

**Cmd+S** (Mac) or **Ctrl+S** (Windows/Linux) saves the selected day.

## Development and tests

The application itself has **zero runtime dependencies**. Node.js is only needed to run tests.

```bash
npm install
npm test
npm run check
```

Tests cover local-date and daylight-saving behavior, data normalization, legacy migration, hourly highlighting, storage, date navigation, and save/undo behavior.

## Project structure

- `index.html` — accessible application layout and slot template
- `assets/css/style.css` — responsive styling and print view
- `assets/js/core.js` — pure planner/date/storage helpers (also usable from Node tests)
- `assets/js/script.js` — accessible interface interactions and persistence
- `tests/` — unit and interface smoke tests

## Privacy

Daymark does not send plans to a server. It uses browser local storage and does not include advertising, analytics, tracking code, or external JavaScript services.

## Credits

Originally created as a JavaScript work-day scheduler learning project by the repository author. Redesigned as Daymark while retaining the original local-first purpose.
