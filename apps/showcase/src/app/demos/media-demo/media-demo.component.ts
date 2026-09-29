import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardLoader, ContentLoader, YoutubePlayer } from '@wiltech-labs/ngx-media';

@Component({
  selector: 'app-media-demo',
  standalone: true,
  imports: [CommonModule, CardLoader, ContentLoader, YoutubePlayer],
  templateUrl: './media-demo.component.html',
  styleUrls: ['./media-demo.component.css']
})
export class MediaDemoComponent {
  loading = signal(true);
  videoId = 'dQw4w9WgXcQ';

  toggleLoading() {
    this.loading.update((value) => !value);
  }
}
