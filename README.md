# Rota Logger

A small offline app for logging your own shifts and checking them against your payslip.

- Log date, start/finish, unpaid break and service; or mark A/L, Sick or a day off
- Split days: add several parts of the day, each with its own service (split shifts, or a day across two services)
- Zero-hours mode (contract hours = 0): totals, weekly averages and a short note about the UK Employment Rights Act 2025
- Add your own services/locations in the app (Settings, or "+ Other service…" while logging)
- Weekly totals against your contract hours
- Period balance: green when you're over contract (overtime), red when under
- Totals per service/location
- Copy to Notes, Share, and PDF download
- Export/import a JSON backup

**Your data never leaves your device.** It is stored in the browser's local storage; there is no server or account.

## Use it on your phone

1. Open the app's GitHub Pages link in Chrome (Android) or Safari (iPhone).
2. Android: menu → *Install app* / *Add to Home screen*. iPhone: Share → *Add to Home Screen*.
3. It then works offline.

Because data is stored per device, use **Settings & backup → Export backup** now and then.

## Host it on GitHub Pages

1. Create a new public repository and upload all the files in this folder (keep the `icons` folder).
2. Repo **Settings → Pages**: Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)`.
3. After a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.

When you change any file, edit `CACHE = 'rota-logger-v4'` in `sw.js` (e.g. to `v2`) so installed copies pick up the update.

## Customise for your workplace

Open `index.html` and look near the top of the `<script>`:

- `PER` – the accounting periods: `["Label", "start date (a Monday), YYYY-MM-DD", number of weeks]`
- `DEFSV` – the default service names ("Service 1", "Service 2"). Users rename them in Settings, or import a small setup file such as `{"svcs":["My Service A","My Service B"]}` via *Settings → Import backup*
- `ZH_AVG`, `ZH_WEEKS` – when the zero-hours note appears (average hours per week over at least this many complete weeks)
- Contract hours per week can be changed in the app under *Settings & backup* (default 39).

## Disclaimer

A personal record-keeping aid, not an official timesheet or payroll tool.

MIT licensed.
