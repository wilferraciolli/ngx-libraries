import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeResourceUrl } from '@angular/platform-browser';

/** Embeds a YouTube video by id, using the privacy-enhanced (youtube-nocookie.com) player. */
@Component({
  selector: 'ngx-youtube-player',
  standalone: true,
  imports: [],
  templateUrl: './youtube-player.html',
  styleUrl: './youtube-player.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YoutubePlayer {
  private readonly sanitizer = inject(DomSanitizer);

  public readonly videoId = input.required<string>();
  public readonly autoplay = input(false);
  /** Accessible name of the embed — name the video, e.g. "Product tour video". */
  public readonly title = input('YouTube video player');

  protected readonly url = computed<SafeResourceUrl>(() => {
    const params = new URLSearchParams({ autoplay: this.autoplay() ? '1' : '0' });
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${this.videoId()}?${params.toString()}`
    );
  });
}
