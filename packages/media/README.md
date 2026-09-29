# @wiltech-labs/ngx-media

Shared Angular media components: skeleton loaders to show while data is fetched, and a YouTube
player.

## Installation

```bash
npm install @wiltech-labs/ngx-media
```

Peer dependencies: `@angular/core`, `@angular/common`, `@angular/platform-browser` (all `^22`).
No Material dependency — the loaders are styled with plain CSS.

## Skeleton loaders

### `CardLoader`

A card skeleton with an avatar + title/subtitle header and a body, YouTube-card-style.

```ts
import { Component } from '@angular/core';
import { CardLoader } from '@wiltech-labs/ngx-media';

@Component({
  selector: 'app-video-list',
  imports: [CardLoader],
  template: `
    @if (loading()) {
      <app-card-loader />
    } @else {
      <!-- real content -->
    }
  `
})
export class VideoListComponent {
  // ...
}
```

`[lines]` (default `2`) controls how many shimmer lines its body renders.

### `ContentLoader`

A generic placeholder that fills whatever space its container gives it with shimmer lines shaped
like paragraph text — drop it into any component in place of its real content while data loads.

```html
@if (loading()) {
  <app-content-loader [lines]="4" />
} @else {
  <p>{{ article().body }}</p>
}
```

### Theming

Both loaders shimmer using CSS custom properties, so they follow whatever theme the host app sets:

```css
:root {
  --ngx-media-loader-base: #e2e2e2;
  --ngx-media-loader-highlight: #f0f0f0;
  --ngx-media-loader-border: rgba(0, 0, 0, 0.08); /* CardLoader's outer border only */
}
```

## `YoutubePlayer`

Embeds a YouTube video by id, using YouTube's privacy-enhanced (`youtube-nocookie.com`) player.

```ts
import { Component } from '@angular/core';
import { YoutubePlayer } from '@wiltech-labs/ngx-media';

@Component({
  selector: 'app-video',
  imports: [YoutubePlayer],
  template: `<app-youtube-player videoId="dQw4w9WgXcQ" />`
})
export class VideoComponent {}
```

`[autoplay]` defaults to `false`. The player fills its container's width at a 16:9 aspect ratio.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── loading/
    │   ├── components/       # CardLoader, ContentLoader
    │   └── styles/            # Shared shimmer mixin
    └── youtube/
        └── components/        # YoutubePlayer
```

## Status

Not yet published to npm — under development.

## Publishing

To publish this package to npm:

```bash
cd packages/media
npm run build
cd dist
npm publish
```

Ensure `version` in `package.json` is updated before publishing per semver conventions.
