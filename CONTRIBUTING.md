# Contributing to wordcampbr

Thank you for contributing! This document covers the workflow for making
changes to the theme, plugin, blueprints, or documentation.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 | https://nodejs.org |
| npm | ≥ 10 | bundled with Node.js |
| Git | any | https://git-scm.com |
| WordPress Studio *(optional)* | latest | https://developer.wordpress.com/studio/ |

---

## Setup

```bash
git clone https://github.com/wordcampbr/wordcampbr.git
cd wordcampbr
npm install
```

---

## Development workflow

### 1. Make changes to the theme or plugin

Edit files under `wp-content/themes/blank-theme/` or
`wp-content/plugins/wordcamp-org/`.

### 2. Sync the blueprint

After **any** change to a theme or plugin file, regenerate the blueprint:

```bash
npm run sync-blueprint
```

This updates `blueprints/blueprint.json` with the current source files.
Commit the updated blueprint together with your code changes.

> **Why?** The CI `tests.yml` workflow runs `npm run check-blueprint` and fails
> if `blueprint.json` is stale. Keeping them in sync ensures the "Try in
> Playground" badge always reflects the latest code.

### 3. Test in Playground

```bash
npm run playground       # Playground CLI — live-reload, mountedPath
npm run playground:web   # Playground CLI — uses blueprint.json (writeFile)
```

### 4. Open a pull request

The CI will:
- Validate plugin and theme headers
- Verify `blueprint.json` is in sync with source files
- Build installable `.zip` files
- Post a Playground link in the PR comment

---

## Versioning

Version strings live in:
- `wp-content/plugins/wordcamp-org/wordcamp-org.php` → `Version:` header
- `wp-content/themes/blank-theme/style.css` → `Version:` header

Bump both when preparing a new version. Use [Semantic Versioning](https://semver.org/):

| Change type | Bump |
|-------------|------|
| Bug fix / patch | `0.1.0` → `0.1.1` |
| New feature (backwards-compatible) | `0.1.0` → `0.2.0` |
| Breaking change | `0.1.0` → `1.0.0` |

---

## Code style

- **PHP**: follow [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/).
- **CSS**: BEM-style class names prefixed with the package text domain (e.g., `wcbr-`, `blank-`).
- **JS**: ESM modules, no transpilation required (targets Node 20+ and modern browsers).
- **Block markup**: use core blocks wherever possible; avoid `core/html` for editable content.

---

## Commit message format

```
type(scope): short description

# Types: feat, fix, chore, docs, style, refactor, test
# Scopes: theme, plugin, blueprint, ci, docs

# Examples:
feat(plugin): add session block
fix(theme): correct footer padding on mobile
chore: sync blueprint
docs: update contributing guide
```

---

## File checklist before opening a PR

- [ ] All WordPress file headers are present and correct
- [ ] `npm run sync-blueprint` was run and the result committed
- [ ] Changes tested locally (Studio or Playground CLI)
- [ ] `npm run check-blueprint` passes locally
