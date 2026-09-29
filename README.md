# SI 679 Notebook

A study notebook for SI 679 (Backend Development), built with [VitePress](https://vitepress.dev) and deployed to GitHub Pages.

## Run it locally

Requires Node 18+.

```bash
npm install
npm run docs:dev       # dev server with hot reload at http://localhost:5173/SI679_notebook/
npm run docs:build     # production build into docs/.vitepress/dist (fails on broken links)
npm run docs:preview   # serve the production build
```

## Folder structure

```
si679-notebook/
├── code-sources.json        which course folders are copied in, and which week they belong to
├── scripts/sync-code.mjs    copies those folders into docs/code/ (read-only; originals untouched)
├── templates/week-template.md
└── docs/
    ├── index.md             home page
    ├── foundations.md       Page 0: JS & TS Foundations
    ├── cheatsheet.md        one-page coding reference (update it as new patterns come up)
    ├── weeks/week-NN.md     one page per week (auto-added to the sidebar)
    ├── code/                GENERATED source pages; don't edit by hand
    └── .vitepress/config.ts site config (base, sidebar, search)
```

## Add a new week

1. **Register the code.** Add an entry to `code-sources.json`:
   ```json
   { "slug": "week05-nyt", "label": "Week 5 in-class: …", "from": "si-679-f-26-week05-nyt-…", "week": "week-05" }
   ```
   `from` is relative to the course folder (this repo's parent by default; set `COURSE_DIR` to change it).
2. **Sync the code.** Run `npm run sync-code`. This regenerates `docs/code/` from the originals. Re-run it whenever the in-class code changes.
3. **Write the page.** Copy `templates/week-template.md` to `docs/weeks/week-05.md` and set its `title`. The sidebar and nav pick it up automatically.
4. **Update the home page.** Link the week in the table in `docs/index.md`.
5. **Check it.** Run `npm run docs:build`. It fails if any link is broken.
6. **Commit and push**, including `docs/code/`. GitHub Actions can't see the course folders, so the synced copies have to be committed.

## Deploy to GitHub Pages

1. Create a GitHub repo named **`SI679_notebook`**. If you pick another name, change `REPO_NAME` in `docs/.vitepress/config.ts`.
2. Push this folder to its `main` branch.
3. In the repo, go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Every push to `main` runs `.github/workflows/deploy.yml`, which builds and publishes the site to `https://<your-username>.github.io/SI679_notebook/`.
