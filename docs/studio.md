# Using WordPress Studio

[WordPress Studio](https://developer.wordpress.com/studio/) is a local
development environment built by Automattic. It provides a full WordPress
stack (PHP, MySQL, WP-CLI) without Docker or manual configuration.

---

## Why Studio for this project

- **Real database** — content, options, and users persist across restarts.
- **WP-CLI built-in** — run any WP-CLI command without extra setup.
- **Playground runtime** — Studio sites can also use the Playground runtime
  (`runtime: "playground"`) for a zero-database, in-memory WordPress.
- **Symlink support** — the monorepo `wp-content/` directories can be symlinked
  directly into a Studio site for live editing.

---

## Setup (once)

### 1. Create a Studio site

Open Studio and create a new site named **wordcampbr**.  
Default path: `~/Studio/wordcampbr`.

### 2. Clone the monorepo

```bash
git clone https://github.com/wordcampbr/wordcampbr.git ~/wordcampbr-repo
```

### 3. Symlink packages

```bash
STUDIO=~/Studio/wordcampbr
REPO=~/wordcampbr-repo

ln -s "$REPO/wp-content/themes/blank-theme"   "$STUDIO/wp-content/themes/blank-theme"
ln -s "$REPO/wp-content/plugins/wordcamp-org" "$STUDIO/wp-content/plugins/wordcamp-org"
```

### 4. Activate

In Studio's terminal (or via the WP-CLI tab):

```bash
wp theme activate blank-theme
wp plugin activate wordcamp-org
```

---

## Day-to-day workflow

1. Start the Studio site.
2. Edit files in `~/wordcampbr-repo/` — changes appear immediately.
3. Use Studio's browser preview to review changes.
4. After editing theme/plugin files, run:
   ```bash
   cd ~/wordcampbr-repo && npm run sync-blueprint
   ```
5. Commit both the source change and the updated `blueprints/blueprint.json`.

For changes made in the **WordPress admin or Site Editor** (template parts,
navigation, media uploads), see [docs/content-workflow.md](content-workflow.md).

---

## Studio + Playground runtime

For a zero-database local site (e.g., for UI-only work), use Studio's
Playground runtime:

1. In Studio, create a site with runtime **Playground**.
2. Follow the same symlink steps above.
3. The Playground runtime runs in-memory — no persistent database.

Alternatively, skip Studio entirely and use `npm run playground` (Playground CLI).

---

## Useful WP-CLI commands

```bash
# Activate / deactivate
wp theme activate blank-theme
wp plugin activate wordcamp-org
wp plugin deactivate wordcamp-org

# Reset site to a clean state
wp db reset --yes && wp core install \
  --url=http://localhost:8896 \
  --title="WordCamp BR" \
  --admin_user=admin \
  --admin_password=password \
  --admin_email=admin@example.com

# Check for PHP errors
wp eval 'error_reporting(E_ALL); require WP_CONTENT_DIR . "/plugins/wordcamp-org/wordcamp-org.php";'
```

---

## Pushing to WordPress.com

> Studio supports pushing a local site to WordPress.com (Pressable or
> WordPress.com hosting). Use `studio auth login` first, then `site_push`.

This is outside the scope of the monorepo workflow and is only relevant when
deploying a specific event's production site.
