# wordcampbr

WordPress monorepo for **WordCamp Brasil** — organized as a standard WordPress
`wp-content/` tree so theme and plugin paths are predictable and symlink-free.

[![Tests](https://github.com/wordcampbr/wordcampbr/actions/workflows/tests.yml/badge.svg)](https://github.com/wordcampbr/wordcampbr/actions/workflows/tests.yml)
[![Try in Playground](https://img.shields.io/badge/Try%20in-WordPress%20Playground-3858e9?logo=wordpress&logoColor=white)](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/wordcampbr/wordcampbr/trunk/blueprints/blueprint.json)

---

## Packages

| Package | Type | Path | Description |
|---------|------|------|-------------|
| [`blank-theme`](wp-content/themes/blank-theme/) | Block theme (FSE) | `wp-content/themes/blank-theme/` | Zero-opinion base theme for all WordCamp Brasil events |
| [`wordcamp-org`](wp-content/plugins/wordcamp-org/) | Plugin | `wp-content/plugins/wordcamp-org/` | Core blocks, REST endpoints, and site helpers |

---

## Quick start

### Option A — WordPress Playground (browser, no install)

Click the badge above or open:

```
https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/wordcampbr/wordcampbr/trunk/blueprints/blueprint.json
```

The blueprint writes the theme and plugin files directly into the Playground
virtual filesystem — no external proxy, no release needed.

### Option B — Playground CLI (local, live-reload)

Requires [Node.js 20+](https://nodejs.org/).

```bash
git clone https://github.com/wordcampbr/wordcampbr.git
cd wordcampbr
npm install
npm run playground
```

Opens a local WordPress instance at `http://localhost:9400` (or next available
port) with the theme and plugin **mounted** from your working directory.
Changes to source files are reflected immediately — no rebuild needed.

### Option C — WordPress Studio (recommended for full development)

[Studio](https://developer.wordpress.com/studio/) runs a full local WordPress
server with a real database.

```bash
# 1. Clone the repo
git clone https://github.com/wordcampbr/wordcampbr.git wordcampbr-monorepo

# 2. In Studio, create a new site (or use an existing one)
#    Site path: ~/Studio/wordcampbr   (or any path you prefer)

# 3. Symlink packages into the Studio site
STUDIO_SITE=~/Studio/wordcampbr
REPO=~/wordcampbr-monorepo

ln -s "$REPO/wp-content/themes/blank-theme"    "$STUDIO_SITE/wp-content/themes/blank-theme"
ln -s "$REPO/wp-content/plugins/wordcamp-org"  "$STUDIO_SITE/wp-content/plugins/wordcamp-org"

# 4. In Studio, activate blank-theme and wordcamp-org
```

See [docs/studio.md](docs/studio.md) for the full Studio workflow.

---

## Repository layout

```
wordcampbr/
├── .github/
│   └── workflows/
│       ├── tests.yml          ← Header validation + blueprint sync check
│       └── playground.yml     ← Build zips + PR comment with Playground link
├── wp-content/
│   ├── plugins/
│   │   └── wordcamp-org/      ← Main plugin (see its README)
│   └── themes/
│       └── blank-theme/       ← Block theme (see its README)
├── blueprints/
│   ├── blueprint.json         ← AUTO-GENERATED — do not edit by hand
│   └── blueprint-local.json   ← For Playground CLI (mount, live-reload)
├── scripts/
│   └── sync-blueprint.js      ← Generates blueprint.json from source files
├── docs/
│   ├── local-development.md
│   ├── studio.md
│   └── playground.md
├── package.json
└── .gitignore
```

### What is committed

✅ PHP, CSS, JS, JSON, HTML source files  
✅ Generated `blueprints/blueprint.json` (kept in sync by CI)  
❌ No `*.zip`, `*.sql`, `*.wpress`, no `wp-content/uploads/`  
❌ No `node_modules/`, no build artifacts

---

## Blueprints

| File | Purpose | How to use |
|------|---------|-----------|
| `blueprints/blueprint.json` | Embeds all source files via `writeFile` steps. Works in [playground.wordpress.net](https://playground.wordpress.net). | `?blueprint-url=<raw_github_url>` |
| `blueprints/blueprint-local.json` | Mounts local directories (live-reload). Requires Playground CLI. | `npm run playground` |

### Keeping blueprint.json in sync

`blueprint.json` is generated automatically — never edit it by hand.

After changing any theme or plugin file:

```bash
npm run sync-blueprint   # regenerate blueprint.json
git add blueprints/blueprint.json
git commit -m "chore: sync blueprint"
```

CI runs `npm run check-blueprint` and fails if the blueprint is stale.

---

## CI / GitHub Actions

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `tests.yml` | every push & PR | Validates plugin/theme headers; checks blueprint sync |
| `playground.yml` | every push & PR | Builds installable `.zip` files; posts Playground link on PRs |

### PR Playground preview

Every pull request gets a bot comment with a **direct Playground link** that
loads the blueprint from the PR branch's HEAD commit — no artifacts needed.

Installable `.zip` files (for manual testing in a real WordPress install) are
uploaded as workflow artifacts and kept for 14 days.

---

## Local development

See [docs/local-development.md](docs/local-development.md) for a full guide
covering Studio, Playground CLI, and WP-CLI.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

GNU General Public License v2 or later — see [LICENSE](LICENSE).
