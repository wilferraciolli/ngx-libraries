import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { Type } from '@angular/core';
import { ModalConfig, ModalService } from '@wiltech-labs/ngx-modals';

/**
 * Every modal in these stories is opened by a click, through `ModalService.open()` — there's no
 * `args`-driven way to show an overlay directly. This host renders one button that opens
 * `content` with `config`, and prints whatever `afterClosed()` resolves to (the Actions panel
 * also logs it, via the `(resultChange)` wrapper below).
 */
@Component({
  selector: 'sb-modal-trigger-host',
  standalone: true,
  imports: [JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="Story-stack">
      <button type="button" (click)="openModal()">{{ buttonLabel() }}</button>
      @if (result(); as data) {
        <pre class="Story-output">afterClosed() = {{ data | json }}</pre>
      }
    </div>
  `,
})
export class ModalTriggerHost {
  private readonly modals = inject(ModalService);

  public readonly content = input.required<Type<unknown>>();
  public readonly config = input<ModalConfig>({});
  public readonly buttonLabel = input('Open modal');

  protected readonly result = signal<unknown>(null);

  protected openModal(): void {
    this.modals
      .open(this.content(), this.config())
      .afterClosed()
      .subscribe((result) => this.result.set(result ?? { action: 'CLOSED_WITHOUT_RESULT' }));
  }
}
