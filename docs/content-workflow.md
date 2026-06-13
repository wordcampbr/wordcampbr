# Content Workflow — committing admin changes

This document describes how to persist WordPress admin changes (Site Editor,
media uploads, navigation) back into the repository so they are reproduced
every time the Playground blueprint runs.

---

## Two approaches

| | Approach A — theme files | Approach B — WXR + orphan branch |
|---|---|---|
| **Where content lives** | `blank-theme/parts/*.html` (git, main branch) | `blueprints/content.xml` (git, main branch) + `uploads/` (git, orphan branch) |
| **Who edits it** | Developer (text editor / git) | Anyone (WordPress Site Editor → export) |
| **Media handling** | Not needed (no attachments) | `uploads` orphan branch → embedded in blueprint |
| **Best for** | Simple structural templates with no DB-specific data | Templates that reference navigation menus, site logo, or were edited in the Site Editor |

Both approaches can coexist. Theme files act as fallbacks; if a `wp_template_part`
DB record exists (imported via WXR), WordPress uses the DB record and ignores the
theme file.

---

## Approach A — edit theme files directly

Template parts live as plain HTML block markup under the theme.
No database round-trip required.

```
blank-theme/
└── parts/
    ├── header.html
    └── footer.html
```

**Workflow:**

```bash
# 1. Edit the file directly
$EDITOR wp-content/themes/blank-theme/parts/header.html

# 2. Regenerate and commit
npm run sync-blueprint
git add -A && git commit -m "feat: update header"
```

**Limitation:** if WordPress has a DB override for the same template part
(e.g. from a previous Site Editor session), the file version is silently
ignored. Delete the DB record first:

```bash
wp post list --post_type=wp_template_part --fields=ID,post_name
wp post delete <ID> --force
```

---

## Approach B — WXR export + orphan `uploads` branch

Use this when template parts were edited in the Site Editor, when navigation
menus need to be preserved, or when media attachments (logos, images) must be
available in Playground.

### Repository layout

```
main branch
├── blueprints/
│   ├── blueprint.json     ← generated (never edit by hand)
│   └── content.xml        ← WXR: wp_template_part + wp_navigation
└── scripts/
    └── sync-blueprint.js  ← reads uploads branch + embeds WXR

uploads branch (orphan — no shared history with main)
└── uploads/
    ├── logo.svg
    └── (other media files…)
```

### Step-by-step workflow

#### 1. Edit in the Site Editor (local Studio)

Make your changes normally — modify template parts, update navigation, upload
images via the WordPress media library.

#### 2. Export template parts and navigation

```bash
wp export --post_type=wp_template_part,wp_navigation \
          --filename_format=content \
          --dir=/tmp
cp /tmp/content blueprints/content.xml
```

> **Tip (Studio):** `wp export --dir` requires an absolute path that exists
> inside the Playground filesystem. Use `/tmp` and then copy the result.

#### 3. Add new media to the `uploads` orphan branch

Only needed when you uploaded new images or files via the media library.

```bash
# Switch to the orphan branch (it has no files from main)
git checkout uploads

# Copy the file from your local WordPress uploads directory
cp /path/to/file.svg uploads/file.svg

# Commit to the orphan branch
git add uploads/file.svg
git commit -m "chore: add file.svg"

# Return to main
git checkout main
```

Then register the asset in `scripts/sync-blueprint.js` by adding an entry to
`UPLOAD_ASSETS`:

```js
const UPLOAD_ASSETS = [
  {
    branchPath: 'uploads/file.svg',          // path inside the uploads branch
    wpPath: '/wordpress/wp-content/uploads/assets/file.svg',  // Playground path
    mimeType: 'image/svg+xml',
    siteOption: 'site_logo',                 // optional: wp_options key to store attachment ID
  },
];
```

#### 4. Regenerate the blueprint

```bash
npm run sync-blueprint
```

Output confirms what was included:

```
✔  blueprints/blueprint.json regenerated (11 theme/plugin files, 1 media asset, WXR import: yes)
```

#### 5. Commit and push both branches

```bash
git add blueprints/content.xml blueprints/blueprint.json scripts/sync-blueprint.js
git commit -m "feat: update header with site logo"
git push origin main uploads   # push both branches in one command
```

---

## What the blueprint does at runtime (Playground)

The generated `blueprint.json` runs these steps in order:

1. **`writeFile`** — theme (`blank-theme`) and plugin (`wordcamp-org`) source files
2. **`writeFile` + `runPHP`** — media assets from the `uploads` branch:
   writes the file to the virtual filesystem, creates a `wp_attachment` post,
   and sets any linked `wp_options` key (e.g. `site_logo`)
3. **`activateTheme`** + **`activatePlugin`**
4. **`importWxr`** — imports `content.xml`; template parts and navigation land
   in the database as CPT records and take priority over theme files

---

## Finding the uploads path in a Studio site

When using WordPress Studio, the WordPress root lives inside a temporary
Playground container. Use WP-CLI to discover it:

```bash
wp eval "echo ABSPATH;"
# → /var/folders/.../tmp/.../wordpress/

wp eval "echo wp_get_upload_dir()['basedir'];"
# → /var/folders/.../tmp/.../wordpress/wp-content/uploads
```

The uploaded file is then at:

```bash
wp post get <attachment_ID> --field=guid
# → http://localhost:8897/wp-content/uploads/2026/06/logo.svg
```

Translate the URL path to the absolute filesystem path shown above.

---

## Resetting template part DB overrides

If a template part in the DB conflicts with the theme file and you want to
fall back to Approach A:

```bash
# List all DB-stored template parts
wp post list --post_type=wp_template_part --fields=ID,post_name,post_status

# Delete a specific override (WordPress will fall back to the theme file)
wp post delete <ID> --force
```
