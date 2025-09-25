# Reorder Playlist

A small Vue 3 + TypeScript app to preview and apply reordering of YouTube playlists.

- Live mode (default): authenticates with your Google account and works on your real playlists.
- Dev/Fixture mode: uses local data so you can try the UI with no API access. Enable with `VITE_YT_MODE=dev`.

## Prerequisites

- Node.js: 20.19+ (or 22.12+). Earlier 20.x may show engine warnings with Vite 7.
- npm 10+

## Install

```powershell
npm ci
```

## Running the app

### Dev/Fixture mode

Set `VITE_YT_MODE=dev` to use the local facade (no Google sign-in required).

```powershell
npm run dev
```

Open the URL shown by Vite (usually http://localhost:5173/). In dev mode the dropdown will show the fixture playlist; click `Load` to bring items in.

### Live mode (default)

This uses Google Identity Services (OAuth 2.0) in the browser. The OAuth Client ID is embedded in the app and safe to ship (it’s a public identifier). If you need to use your own client, see the note below.

Live mode is on by default. No environment variable is needed. To switch back to the dev facade, set `VITE_YT_MODE=dev`.

- PowerShell (recommended on Windows):

```powershell
$env:VITE_YT_MODE = 'dev'; npm run dev
```

- Command Prompt (cmd.exe):

```bat
set VITE_YT_MODE=dev && npm run dev
```

- Bash (macOS/Linux/Git Bash):

```bash
VITE_YT_MODE=dev npm run dev
```

Alternatively, create an environment file so you don’t have to remember shell syntax:

- Create a file named `.env.local` in the repo root with:

```
VITE_YT_MODE=dev
```

Then just run:

```powershell
npm run dev
```

In the app:

- Click `Refresh` to sign in and list your playlists.
- Pick a playlist from the dropdown, then click `Load`.
- Reorder items with the buttons or keyboard, then `Apply Changes` to push to YouTube.

## Tests and lint

```powershell
npm test
npm run lint
```

## Build for production

```powershell
npm run build
npm run preview
```

## Configuration notes

- Live/Dev toggle: controlled by `VITE_YT_MODE` (`dev` = local fixture facade; anything else or missing = live API).
- Google OAuth Client ID: currently hardcoded in `src/lib/youtubeAuth.ts` as a public identifier for browser OAuth. If you need to change it, edit that file and replace the constant with your own client ID.
- Scopes: the app requests `https://www.googleapis.com/auth/youtube` to list playlists and apply reorder operations.
- OAuth safety: never put client secrets or unrestricted API keys in frontend code. The OAuth Client ID is public by design; restrict OAuth app origins and scopes in Google Cloud Console.

## Keyboard shortcuts

- Up/Down: move selected item
- Ctrl+Up/Down: jump by 5
- Home/End: move to first/last position
- Enter: move to specific position
- ?: toggle help

## Troubleshooting

- Engine warnings on install: ensure Node 20.19+ or 22.12+.
- Can’t list playlists in live mode: make sure the Google account has YouTube channel access and consented to the requested scope. Try `Refresh` again.
- Apply fails with “precondition failed”: the playlist changed externally; click `Load` to refresh and try again.

---

If you’d like, we can add `.env` presets (e.g., `.env.development`/`.env.production`) or npm scripts like `dev:live` and `dev:fixture` for one-command toggles.
