import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface NodeDetailData {
  name: string;
  role: string;
}

/** Read-only content with no `ModalContent` — a modal that never prompts on close, the right
 *  choice for a modeless, non-dirty panel like an org chart's node details. */
@Component({
  selector: 'sb-node-detail-modal-content',
  standalone: true,
  template: `
    <div class="Story-stack" style="padding: 16px">
      <p>
        <strong>{{ data()?.name }}</strong>
      </p>
      <p>{{ data()?.role }}</p>
    </div>
  `,
})
export class NodeDetailModalContent {
  public readonly data = input<NodeDetailData>();
}
