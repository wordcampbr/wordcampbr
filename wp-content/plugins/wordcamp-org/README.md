# wordcamp-org

WordPress plugin providing core functionality for **WordCamp Brasil** sites.

## Planned features

| Area | Status | File |
|------|--------|------|
| Block registration | 🔜 planned | `includes/blocks.php` |
| REST API endpoints | 🔜 planned | `includes/rest-api.php` |
| Site-setup helpers | 🔜 planned | `includes/setup.php` |
| Block patterns | 🔜 planned | `patterns/` |

## Adding a feature

1. Create the file under `includes/`.
2. Uncomment the matching `require_once` line in `wordcamp-org.php`.
3. Update this README with the new status.
4. Run `npm run sync-blueprint` to rebuild `blueprints/blueprint.json`.
5. Open a pull request — the CI will validate the blueprint is in sync.

## Adding a block

1. Create `src/blocks/{block-name}/` with `block.json`, `index.js`, `edit.js`, `render.php`.
2. Register in `includes/blocks.php` using `register_block_type`.
3. Add a build step to `package.json` scripts.

## Version

Bump `Version` in `wordcamp-org.php` for every release.
