# made by Water

Static site. No build step. Open `index.html`, or run `python -m http.server 8000`.

## Adding things (the easy way)
Open `add.html` (not linked from the site), fill the form, copy the block, paste it into `js/config.js`.

## Adding things (by hand)
Everything lives in `js/config.js`.

- **Project**: add an object to `projects`. Give it `status: "IN PROGRESS"` or `"SHIPPED"` and it also shows up in the project archive. Optional `params: { lagReduction: "40%" }` adds a row in the hub readout.
- **Archive only**: list a project title in `hub` to set its status without touching the project object.
- **Code specimen**: add `{ file, note, code }` to `specimens`. Use real tabs, no underscores in names, `task.wait` not `wait`.
- **Role and result**: every project can have `role` and `result`. They show on the card and in the hub readout. A number beats a sentence.
- **Commissions**: edit `commission` (status OPEN, LIMITED or CLOSED, a note, and the four terms). It drives the contact panel and the hero badge.
- **Hero words**: edit `phrases`.
- **Pages**: `sections` sets the nav order. Number keys jump to pages in that order.

## Navigation and shortcuts
The circular wheel has been removed. Use the header navigation to move between About, Work, All projects, Code, Experience, and Contact. `Ctrl K` or `/` opens the command palette; `Esc` closes it. Reduced-motion settings are respected.

## Brand and visual style
The public-facing brand is **made by Water**. The current UI uses a dark neutral palette, one soft blue accent, sharp corners, and restrained transitions. The hero leaves space for a future transparent avatar image at `assets/images/water-avatar.png`.

## Projects and History pages
Both are drawn from `js/config.js` by `js/work.js`.

- **Projects** shows one project at a time (what it is, my role, result, built with, links). The strip underneath lists them all. Groups: Full games (`FULL GAME`), Systems (`GAMEPLAY`, `RPG SYSTEM`, `OPTIMIZATION`), UI design (`UI DESIGN`). Arrow keys flip between projects.
- A project's status chip is worked out for you: `On hold` if its hub status is ON HOLD, `In development` if it is IN PROGRESS or its result says "in development", `Live on Roblox` if it has a `link`, otherwise `System demo` or `Design`.
- **History** lists `timeline` newest first. The first entry is shown as the current role.

## The fit rule
Every page follows the same three steps, in order:

1. **Make it fit.** The layout is built to fit the screen.
2. **If it does not fit, scroll in its own frame.** The frame that overflows (a project list, the info column, a whole page on a phone) scrolls by itself. Mark any new panel with the `owns-scroll` class. The mouse wheel scrolls it first, and only turns the page once the frame is at its edge.
3. **If it still does not fit, scale it.** `js/fit.js` shrinks the whole UI to fit, like UIScale in Roblox. The design minimum is 360 x 640 and it never goes below 55%. Change `MIN_W`, `MIN_H` and `MIN_SCALE` at the top of that file.

Use `var(--vh)` and `var(--vw)` instead of `vh` and `vw` in CSS, so step 3 can correct them.

## Live Roblox data
A project whose `link` is a Roblox game (`https://www.roblox.com/games/<id>/...`) pulls its info from Roblox by itself: the game description, screenshots, players online right now, total visits and like percentage. You no longer need to fill in `desc` or `src` for those. If you leave them in, they are only the fallback shown when Roblox cannot be reached.

Still manual, because Roblox cannot know them: `title`, `role`, `result`, `tags`, `category`.

Projects with no Roblox link (systems, UI designs, videos) work exactly as before. To keep a game project fully manual, add `live: false` to it.

How it stays fresh:
1. **Live.** On load the site asks Roblox through a CORS proxy (Roblox blocks direct browser requests from other sites). While Projects or Hub is open, the numbers refresh every minute.
2. **Snapshot.** `.github/workflows/roblox-sync.yml` runs every 30 minutes, fetches the same data on GitHub's servers and saves it to `data/roblox.json`. The site shows this instantly and uses it if the proxy is down. It only commits when something real changed (name, description, pictures), or every 6 hours, so your history is not flooded.
3. **Last visit.** The newest live result is remembered in the visitor's browser.
4. **config.js.** The text and image you wrote, as the last resort.

One-time setup on GitHub:
- Settings > Actions > General > Workflow permissions > **Read and write permissions** > Save.
- Actions tab > **Sync Roblox data** > **Run workflow**, to fill `data/roblox.json` the first time.

Run it yourself any time: `node scripts/sync-roblox.mjs` (Node 18 or newer).

To use your own proxy instead of the public ones, add `rbxProxies: ["https://your-worker.example.workers.dev/?url="]` to `config.js`. The site appends the encoded Roblox URL to each entry.
