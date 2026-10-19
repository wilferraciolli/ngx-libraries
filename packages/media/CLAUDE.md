# @wiltech-labs/ngx-media

Shared Angular media components — skeleton loaders shown while data is fetched, and a YouTube
player. See root `../../CLAUDE.md` for repo-wide conventions.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── loading/
    │   ├── components/
    │   │   ├── card-loader/      # CardLoader — avatar + title/subtitle header, YouTube-card-style
    │   │   └── content-loader/   # ContentLoader — fills its container with N shimmer lines
    │   └── styles/                # Shared shimmer animation mixin
    └── youtube/
        └── components/
            └── youtube-player/    # YoutubePlayer — embeds a video by id
```

## Conventions

- Real Angular constructs (`@Component`) — not framework-agnostic functions. Every known consumer
  is Angular, so idiomatic DI beats a generic-TS compromise.
- One folder per concern under `src/lib/` — don't let it go flat. A new concern (e.g. audio,
  image) gets its own folder alongside `loading/` and `youtube/`.
- Standalone components only, no NgModules.
- Skeleton loaders are built natively (no `ngx-skeleton-loader` or similar dependency) — plain
  CSS shimmer animation shared via `loading/styles/_shimmer.mixins.scss`, coloured from M3 surface
  tokens (`--ngx-media-loader-base`/`-highlight`/`-surface` override them). No Material dependency.
- Loaders are decorative: `aria-hidden` on the host; the consumer marks its region `aria-busy`.
- `CardLoader` composes `ContentLoader` for its body instead of duplicating the shimmer-line
  markup — keep reusing `ContentLoader` for any new "block of placeholder lines" need.
- `YoutubePlayer` uses `youtube-nocookie.com` (YouTube's privacy-enhanced embed domain) and
  `DomSanitizer.bypassSecurityTrustResourceUrl` on a URL built from the caller-supplied video id —
  do not accept a raw URL/iframe src from the caller, only the id, so there's nothing to sanitize
  beyond what this package constructs itself.

## Status

- New package, initial component set only (`CardLoader`, `ContentLoader`, `YoutubePlayer`).
- Not yet published to npm — under development.
- No consumers yet.
