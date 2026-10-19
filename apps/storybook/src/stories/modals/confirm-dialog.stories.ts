import type { Meta, StoryObj } from '@storybook/angular';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { moduleMetadata } from '@storybook/angular';
import { JsonPipe } from '@angular/common';
import { ModalService } from '@wiltech-labs/ngx-modals';

@Component({
  selector: 'sb-confirm-trigger',
  standalone: true,
  imports: [JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="Story-stack">
      <button type="button" (click)="askToDelete()">Delete policy document</button>
      @if (confirmed(); as value) {
        <pre class="Story-output">confirm() resolved {{ value }}</pre>
      }
    </div>
  `,
})
class ConfirmTrigger {
  private readonly modals = inject(ModalService);
  protected readonly confirmed = signal<boolean | null>(null);

  protected askToDelete(): void {
    this.modals
      .confirm('Delete this document? This cannot be undone.', {
        confirmLabel: 'Delete',
        cancelLabel: 'Keep it',
      })
      .subscribe((result) => this.confirmed.set(result));
  }
}

const meta: Meta<ConfirmTrigger> = {
  title: 'ngx-modals/Confirm dialog',
  component: ConfirmTrigger,
  decorators: [moduleMetadata({ imports: [ConfirmTrigger] })],
  parameters: {
    docs: {
      description: {
        component: `\`ModalService.confirm(message, options)\` opens the same Yes/No prompt the unsaved-changes guard uses internally — reusable directly for anything else that wants it, e.g. a delete confirmation.

Resolves \`true\` if confirmed, \`false\` otherwise (including Escape, since the dialog disables its own close-without-answering paths). \`disableClose: true\`: the user must pick a button.`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<ConfirmTrigger>;

export const Default: Story = {};
