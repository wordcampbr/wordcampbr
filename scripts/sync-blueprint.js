#!/usr/bin/env node
/**
 * sync-blueprint.js
 *
 * Reads source files from:
 *   wp-content/themes/blank-theme/
 *   wp-content/plugins/wordcamp-org/
 *
 * Reads media assets from the orphan `uploads` branch:
 *   uploads/<file>  (via `git show uploads:<file>`)
 *
 * If blueprints/content.xml exists (WordPress WXR export), embeds an
 * importWxr step so template parts and navigation land in the DB.
 *
 * Regenerates blueprints/blueprint.json.
 *
 * Usage:
 *   node scripts/sync-blueprint.js              # regenerate
 *   node scripts/sync-blueprint.js --check      # CI: exit 1 if blueprint is stale
 *
 * Run via npm:
 *   npm run sync-blueprint
 *   npm run check-blueprint
 *
 * ─── Workflow for committing admin changes ───────────────────────────────────
 *
 *   1. Edit templates / navigation in the Site Editor (local Studio).
 *
 *   2. Export WXR:
 *        wp export --post_type=wp_template_part,wp_navigation \
 *                  --filename_format=content --dir=/tmp
 *      Copy the result to blueprints/content.xml.
 *
 *   3. For new media uploads, add them to the `uploads` orphan branch:
 *        git checkout uploads
 *        cp /path/to/file.svg uploads/
 *        git add uploads/file.svg && git commit -m "chore: add file.svg"
 *        git checkout main
 *      Then register the asset in UPLOAD_ASSETS below.
 *
 *   4. npm run sync-blueprint
 *
 *   5. git add -A && git commit -m "feat: ..." && git push origin main uploads
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, relative, sep, posix } from 'path';
import { execSync } from 'child_process';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

/**
 * Source packages: theme and plugin files embedded as writeFile steps.
 * README.md, dotfiles, and .gitkeep are excluded automatically.
 */
const PACKAGES = [
  {
    wpPath: '/wordpress/wp-content/themes/blank-theme',
    localDir: 'wp-content/themes/blank-theme',
    extensions: ['.css', '.json', '.php', '.html'],
  },
  {
    wpPath: '/wordpress/wp-content/plugins/wordcamp-org',
    localDir: 'wp-content/plugins/wordcamp-org',
    extensions: ['.php', '.json', '.js', '.css', '.html'],
  },
];

/**
 * Media assets stored in the orphan `uploads` branch.
 * Each entry maps a path inside that branch to a Playground uploads path,
 * a MIME type, and an optional wp_options key to store the attachment ID.
 *
 * Add a new entry here whenever you add a file to the uploads branch.
 */
const UPLOAD_ASSETS = [
  {
    /** Path inside the `uploads` branch (relative to repo root) */
    branchPath: 'uploads/logo.svg',
    /** Where to place the file inside the Playground filesystem */
    wpPath: '/wordpress/wp-content/uploads/assets/logo.svg',
    mimeType: 'image/svg+xml',
    /** wp_options key to store the resulting attachment ID (optional) */
    siteOption: 'site_logo',
  },
];

/** Path to the WXR export (template parts, navigation, etc.). */
const WXR_PATH = join(ROOT, 'blueprints/content.xml');

const OUTPUT = 'blueprints/blueprint.json';

// ---------------------------------------------------------------------------
// Helpers — theme/plugin file steps
// ---------------------------------------------------------------------------

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

function toPosix(p) {
  return p.split(sep).join(posix.sep);
}

function packageSteps({ wpPath, localDir, extensions }) {
  const absDir = join(ROOT, localDir);
  const files = walk(absDir).filter((f) => {
    const name = f.split(sep).pop();
    if (name.startsWith('.') || name === 'README.md' || name === 'readme.txt') return false;
    return extensions.some((ext) => f.endsWith(ext));
  });

  const dirs = new Set([wpPath]);
  for (const absFile of files) {
    const relPath = toPosix(relative(absDir, absFile));
    const parts = relPath.split('/');
    for (let i = 1; i < parts.length; i++) {
      dirs.add(`${wpPath}/${parts.slice(0, i).join('/')}`);
    }
  }

  const mkdirSteps = [...dirs].sort().map((dir) => ({ step: 'mkdir', path: dir }));
  const writeSteps = files.map((absFile) => ({
    step: 'writeFile',
    path: `${wpPath}/${toPosix(relative(absDir, absFile))}`,
    data: readFileSync(absFile, 'utf8'),
  }));

  return [...mkdirSteps, ...writeSteps];
}

// ---------------------------------------------------------------------------
// Helpers — media assets from the `uploads` orphan branch
// ---------------------------------------------------------------------------

/**
 * Read a file from the `uploads` orphan branch using `git show`.
 * Returns the content as a UTF-8 string, or null if not found.
 */
function readFromUploadsBranch(branchPath) {
  try {
    return execSync(`git show uploads:${branchPath}`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch {
    return null;
  }
}

/**
 * Build writeFile + runPHP steps for each UPLOAD_ASSETS entry.
 * Files are read from the `uploads` branch at build time and embedded inline.
 */
function uploadsSteps() {
  const steps = [];
  const dirs = new Set();

  for (const asset of UPLOAD_ASSETS) {
    const data = readFromUploadsBranch(asset.branchPath);
    if (data === null) {
      console.warn(`  ⚠  uploads branch: '${asset.branchPath}' not found — skipping`);
      continue;
    }

    // Ensure parent directory exists.
    const parentDir = asset.wpPath.split('/').slice(0, -1).join('/');
    if (!dirs.has(parentDir)) {
      dirs.add(parentDir);
      steps.push({ step: 'mkdir', path: parentDir });
    }

    // Place the file in the virtual filesystem.
    steps.push({ step: 'writeFile', path: asset.wpPath, data });

    // Create a WP attachment and optionally set a site option.
    const optionLine = asset.siteOption
      ? `update_option('${asset.siteOption}', $attach_id);`
      : '';

    steps.push({
      step: 'runPHP',
      code: [
        '<?php',
        "require '/wordpress/wp-load.php';",
        `$file = '${asset.wpPath}';`,
        `$mime = '${asset.mimeType}';`,
        "$attach_id = wp_insert_attachment(",
        "  ['post_mime_type' => $mime, 'post_title' => pathinfo($file, PATHINFO_FILENAME), 'post_status' => 'inherit'],",
        '  $file',
        ');',
        "require_once ABSPATH . 'wp-admin/includes/image.php';",
        'wp_update_attachment_metadata($attach_id, wp_generate_attachment_metadata($attach_id, $file));',
        optionLine,
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }

  return steps;
}

// ---------------------------------------------------------------------------
// Helpers — WXR import step
// ---------------------------------------------------------------------------

/**
 * If blueprints/content.xml exists, return an importWxr step with its
 * contents embedded as a literal resource.
 */
function wxrStep() {
  if (!existsSync(WXR_PATH)) return [];
  const contents = readFileSync(WXR_PATH, 'utf8');
  return [
    {
      step: 'importWxr',
      file: {
        resource: 'literal',
        name: 'content.xml',
        contents,
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Build blueprint
// ---------------------------------------------------------------------------

const themePluginSteps = PACKAGES.flatMap(packageSteps);
const mediaSteps       = uploadsSteps();
const contentSteps     = wxrStep();

const blueprint = {
  $schema: 'https://playground.wordpress.net/blueprint-schema.json',
  preferredVersions: { php: '8.4', wp: 'latest' },
  login: true,
  steps: [
    ...themePluginSteps,
    ...mediaSteps,
    {
      step: 'activateTheme',
      themeFolderName: 'blank-theme',
    },
    {
      step: 'activatePlugin',
      pluginPath: 'wordcamp-org/wordcamp-org.php',
    },
    ...contentSteps,
  ],
};

const json = JSON.stringify(blueprint, null, 2) + '\n';

// ---------------------------------------------------------------------------
// Write or check
// ---------------------------------------------------------------------------

const outPath = join(ROOT, OUTPUT);
const CHECK   = process.argv.includes('--check');

if (CHECK) {
  let existing;
  try {
    existing = readFileSync(outPath, 'utf8');
  } catch {
    console.error(`✗  ${OUTPUT} does not exist. Run: npm run sync-blueprint`);
    process.exit(1);
  }
  if (existing !== json) {
    console.error(
      `✗  ${OUTPUT} is stale. Run: npm run sync-blueprint\n` +
        '   Then commit the updated blueprint before pushing.'
    );
    process.exit(1);
  }
  console.log(`✔  ${OUTPUT} is up to date.`);
} else {
  writeFileSync(outPath, json);
  const fileCount = themePluginSteps.filter((s) => s.step === 'writeFile').length;
  const mediaCount = mediaSteps.filter((s) => s.step === 'writeFile').length;
  const hasWxr = contentSteps.length > 0;
  console.log(
    `✔  ${OUTPUT} regenerated` +
      ` (${fileCount} theme/plugin file${fileCount !== 1 ? 's' : ''}` +
      `, ${mediaCount} media asset${mediaCount !== 1 ? 's' : ''}` +
      `, WXR import: ${hasWxr ? 'yes' : 'no'})`
  );
}
