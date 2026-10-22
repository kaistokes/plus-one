# +1

A progressive overload tracker for an iPhone, built as an installable web app. It needs no App Store and no Apple developer account. It alternates Plan A and Plan B, shows the weight and reps to beat on every set, and works with no signal in the gym.

## How the targets work

Every exercise uses a 5 to 8 rep range (double progression).

1. **First session.** Log what you can lift close to failure. This calibrates everything after it.
2. **Below 8 on some sets.** Those sets get one more rep next time, at the same weight.
3. **8 on every set.** The weight goes up one step. The new rep target is estimated with the Epley formula, for example 40 × 8 becomes 42.5 × 5.
4. **Jump too big.** If the next step would put you under 5 reps, you keep adding reps past 8 until the jump is safe. This mostly matters for light dumbbells and machines.
5. **Stuck.** Three sessions at one weight without more total reps drops the weight about 10% so you can build back up.

Tick a set when you hit the target. If you didn't, tap the weight or reps and use the plus and minus buttons to log what you actually did. A set below target turns clay coloured.

## Install on your iPhone

1. Open the app's address in Safari: `https://kaistokes.github.io/plus-one/`.
2. Tap Share, then Add to Home Screen. Leave Open as Web App switched on.

## Lock-screen button

This needs iOS 18 or later.

1. Open the Shortcuts app and tap +.
2. Add the action Open URLs and paste the app's address.
3. Name the shortcut `+1` and save it.
4. Lock the phone, wake the screen, then touch and hold the Lock Screen and tap Customise.
5. Tap Lock Screen, then tap the minus on the torch or camera button.
6. Tap the empty slot, search for Shortcut, choose it, then pick `+1`.

The button opens the app in Safari, not the Home Screen copy. Each copy keeps its own storage, so set up backup in both. Backup keeps them in step.

## Backup to GitHub

Your log lives on your phone. Backup copies it to a private GitHub repo whenever you're online, so it survives iOS clearing website data and can be opened on your PC.

1. Create a private repo called `plus-one-data`. It can be empty.
2. Go to GitHub, Settings, Developer settings, Personal access tokens, Fine-grained tokens, and generate a new token.
3. Under Repository access choose Only select repositories, then `plus-one-data`.
4. Under Permissions, set Contents to Read and write. Leave everything else as is.
5. Pick the longest expiry offered and copy the token.
6. In the app, tap the gear, enter your username, the repo name and the token, then tap Save and sync.

Repeat step 6 in each copy of the app (Safari, Home Screen, a PC browser). The token stays on that device. When it expires the app says GitHub rejected the token, and you paste a new one.

Syncing merges sessions by ID, so syncing twice or after a session logged offline never duplicates anything.

## Changing equipment steps

Weights move along a ladder per exercise in [src/domain/catalogue.ts](src/domain/catalogue.ts). Plates step by 2.5 kg per side, the bench bar by 5 kg and the lat pulldown stack by 5 kg. The pushdown stack goes up 2.5 kg at a time to 17.5 kg, then 3.75 kg (21.25, 25, 28.75 and so on). The lateral raise and preacher curl machines follow their Select stack. Dumbbells go up 1 kg at a time to 10 kg, then by `DUMBBELL_ABOVE_10_STEP` (2.5 kg). The weight you log always wins over the suggestion.

## Development

```bash
npm install
npm test
npm run dev
```

`npm run build` type-checks and builds to `dist/`. `npm run icons` re-renders the PNG icons from `scripts/icon.svg`. Pushing to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.

## Planned next

These are out of scope for the first version, and the data model already supports them.

- **Streak counter.** You train every other day, so a day counts if no gap between sessions is longer than 2 days. Every session already stores its date.
- **History chart.** Per exercise, built from the same session log.
- **Editing machines and exercises.** Move the catalogue from code into the stored data and add an edit screen.
