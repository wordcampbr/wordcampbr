# Local Development

Three ways to run this project locally, in order of recommendation.

---

## Option A — WordPress Studio (full database, recommended)

[Studio](https://developer.wordpress.com/studio/) gives you a complete local
WordPress environment with a real MySQL database, PHP 8.x, and WP-CLI.

### First time

```bash
# 1. Create a new Studio site named "wordcampbr" via the Studio UI.
#    This creates ~/Studio/wordcampbr with a running WordPress install.

# 2. Clone the monorepo (separate from the Studio directory)
git clone https://github.com/wordcampbr/wordcampbr.git ~/wordcampbr-repo

# 3. Symlink packages into the Studio site
ln -s ~/wordcampbr-repo/wp-content/themes/blank-theme \
      ~/Studio/wordcampbr/wp-content/themes/blank-theme

ln -s ~/wordcampbr-repo/wp-content/plugins/wordcamp-org \
      ~/Studio/wordcampbr/wp-content/plugins/wordcamp-org

# 4. Activate via Studio's WP-CLI runner (or the WordPress admin UI)
wp --path=~/Studio/wordcampbr theme activate blank-theme
wp --path=~/Studio/wordcampbr plugin activate wordcamp-org
```

### Day-to-day

Edit files in `~/wordcampbr-repo/`. Changes appear immediately in Studio
because the directories are symlinked.

After editing theme or plugin files:

```bash
cd ~/wordcampbr-repo
npm run sync-blueprint   # keep blueprint.json in sync
```

For changes made in the **WordPress admin or Site Editor** (template parts,
navigation, media uploads), see [docs/content-workflow.md](content-workflow.md).

---

## Option B — Playground CLI (no database, live-reload)

Best for quick UI iteration — no database means no persistent content.

### Requirements

- Node.js ≥ 20

### Setup

```bash
git clone https://github.com/wordcampbr/wordcampbr.git
cd wordcampbr
npm install
```

### Run

```bash
npm run playground
```

Opens a local WordPress at `http://localhost:9400` (or next free port).

The `blueprint-local.json` uses `mountedPath` steps to mount the theme and
plugin directories directly from your filesystem. File changes are reflected
immediately — no restart required.

```bash
# Uses blueprint.json (writeFile steps) — closer to what Playground.net sees:
npm run playground:web
```

---

## Option C — Playground.net (browser, read-only)

For testing without any local install:

```
https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/wordcampbr/wordcampbr/trunk/blueprints/blueprint.json
```

This loads the `main` branch. To test a specific branch or commit, replace
`main` with the branch name or SHA.

---

## WP-CLI quick reference

When using Studio, WP-CLI is available via the Studio CLI runner or terminal.

```bash
# List active plugins
wp plugin list --status=active

# Activate plugin
wp plugin activate wordcamp-org

# Activate theme
wp theme activate blank-theme

# Flush rewrite rules (after adding CPTs or custom rewrite rules)
wp rewrite flush

# Export database (never commit the result)
wp db export - > /tmp/wordcampbr-$(date +%Y%m%d).sql
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Symlinks not resolving | Ensure `FollowSymlinks` is on in the Studio site config (it is by default). |
| Blueprint.json fails in Playground | Run `npm run sync-blueprint` and commit the result. |
| Plugin headers missing | Verify `Version:`, `Requires at least:`, `Requires PHP:` headers in `wordcamp-org.php`. |
| Theme headers missing | Verify `Theme Name:`, `Version:` headers in `style.css`. |
