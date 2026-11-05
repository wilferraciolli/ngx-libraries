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
      <ngx-card-loader />
    } @else {
      <!-- real content -->
    }
  `,
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
<ngx-content-loader [lines]="4" />
} @else {
<p>{{ article().body }}</p>
}
```

### Theming

The loaders use the app's M3 tokens, so they're right in light and dark with no setup: the shimmer
runs between `surface-container-highest` and `surface-container-high`, and `CardLoader` sits on a
`surface-container-low` card with `corner-large`, the same surface as a content card. The shimmer
stops under `prefers-reduced-motion`.

For a genuine one-off, override with a token (never a hex value):

```css
.MyPage-feed {
  --ngx-media-loader-surface: var(--mat-sys-surface-container);
}
```

Variables: `--ngx-media-loader-base`, `--ngx-media-loader-highlight`, `--ngx-media-loader-surface`.

### Accessibility

Skeletons are decorative (`aria-hidden="true"` on the host). Mark the region being filled busy and
announce the outcome there:

```html
<section [attr.aria-busy]="loading()">
  @if (loading()) { <ngx-card-loader /> } @else {
  <!-- content -->
  }
</section>
```

## `YoutubePlayer`

Embeds a YouTube video by id, using YouTube's privacy-enhanced (`youtube-nocookie.com`) player.

```ts
import { Component } from '@angular/core';
import { YoutubePlayer } from '@wiltech-labs/ngx-media';

@Component({
  selector: 'app-video',
  imports: [YoutubePlayer],
  template: `<ngx-youtube-player videoId="dQw4w9WgXcQ" />`,
})
export class VideoComponent {}
```

`[autoplay]` defaults to `false`. The player fills its container's width at a 16:9 aspect ratio.

## `FilePicker`

One file, by button or dropped on the zone. It checks `accept` and `maxBytes` before reading
anything; you read the file and upload it.

```ts
import { FilePicker, readAsBase64, type PickedFile } from '@wiltech-labs/ngx-media';

@Component({
  imports: [FilePicker],
  template: `
    <ngx-file-picker
      accept="application/pdf,image/*"
      [maxBytes]="10 * 1024 * 1024"
      label="Choose a file"
      hint="or drop it here · PDF or photo, up to 10 MB"
      (picked)="upload($event)"
      (rejected)="tooBig.set($event.reason === 'size')"
    />
  `,
})
export class UploadPage {
  async upload(picked: PickedFile) {
    const content_base64 = await readAsBase64(picked.file);
    // POST { file_name: picked.name, content_type: picked.type, content_base64 }
  }
}
```

`pickedText` (default `{name} · {size}`) shows the file chosen; `clear()` forgets it. Also
exported: `acceptsFile(file, accept)` and `formatFileSize(bytes, locale?)`.

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
