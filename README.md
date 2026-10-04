# Waterqak.github.io

Static site. No build step. Open `index.html`, or run `python -m http.server 8000`.

## Adding things (the easy way)
Open `add.html` (not linked from the site), fill the form, copy the block, paste it into `js/config.js`.

## Adding things (by hand)
Everything lives in `js/config.js`.

- **Project**: add an object to `projects`. Give it `status: "IN PROGRESS"` or `"SHIPPED"` and it also shows up in the Terminal Hub. Optional `params: { lagReduction: "40%" }` adds a row in the hub readout.
- **Hub only**: list a project title in `hub` to set its status without touching the project object.
- **Code specimen**: add `{ file, note, code }` to `specimens`. Use real tabs, no underscores in names, `task.wait` not `wait`.
- **Role and result**: every project can have `role` and `result`. They show on the card and in the hub readout. A number beats a sentence.
- **Commissions**: edit `commission` (status OPEN, LIMITED or CLOSED, a note, and the four terms). It drives the contact panel and the hero badge.
- **Hero words**: edit `phrases`.
- **Pages**: `sections` sets the nav order. Number keys jump to pages in that order.

## The wheel
Pages sit on one big disc. `--step` in `css/tactical.css` sets the angle between pages, `--wr` the wheel radius, `--peek` how much of the ring shows. Page order is the order of `sections` in `js/config.js`.

## Controls
`Ctrl K` or `/` command palette, `1-7` jump to a page, `?` shortcuts, `Esc` closes.
Terminal commands: `hub`, `code`, `goto <page>`, `palette`, `shortcuts`.
