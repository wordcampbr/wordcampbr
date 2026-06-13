# blank-theme

Minimal WordPress **block theme** (FSE) for WordCamp Brasil.

Provides zero design opinion — no default colors, no typography, no spacing presets.
All visual design is added per-event as CSS custom properties and theme.json overrides.

## Structure

```
blank-theme/
├── style.css          ← Theme header (metadata only, no CSS rules)
├── theme.json         ← appearanceTools + layout widths only
├── functions.php      ← Enqueues style.css on frontend + editor
├── templates/
│   ├── index.html     ← Blog/home
│   ├── single.html    ← Single post
│   ├── page.html      ← Static page
│   ├── archive.html   ← Archive (category, tag, date…)
│   └── 404.html       ← Not found
├── parts/
│   ├── header.html    ← Site header template part
│   └── footer.html    ← Site footer template part
├── patterns/          ← Block patterns (empty; add per-event)
└── assets/            ← Fonts, images (empty; add per-event)
```

## Layout widths

| Token        | Default value | Override in theme.json |
|--------------|--------------|------------------------|
| `contentSize` | `860px`      | `settings.layout.contentSize` |
| `wideSize`    | `1280px`     | `settings.layout.wideSize` |

## Extending per event

1. Override colors and typography in `theme.json → settings.color / settings.typography`.
2. Add custom CSS rules to `style.css`.
3. Add block patterns to `patterns/` (filename convention: `{slug}.php`).
4. Drop fonts in `assets/fonts/` and register them in `theme.json → settings.typography.fontFamilies`.

## Version

Follows [Semantic Versioning](https://semver.org/). Bump `Version` in `style.css` for every release.
