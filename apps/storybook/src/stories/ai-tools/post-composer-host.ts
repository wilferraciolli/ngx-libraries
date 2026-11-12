import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import type { OutputEmitterRef, WritableSignal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { AiGenerate } from '@wiltech-labs/ngx-ai-tools';
import type { AiGenerateResult } from '@wiltech-labs/ngx-ai-tools';
import { FormFieldType, TextField, TextareaField, toSchema } from '@wiltech-labs/ngx-forms';
import type { FieldDef } from '@wiltech-labs/ngx-forms';

interface PostModel {
  title: string;
  body: string;
}

/**
 * Story-only host: `AiGenerate` filling two `ngx-forms` fields, the way an app composes them.
 * `form()` needs an injection context, so it lives in a component rather than a story `render`.
 */
@Component({
  selector: 'story-post-composer',
  standalone: true,
  imports: [AiGenerate, TextField, TextareaField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 640px">
      <ngx-ai-generate
        heading="Write a post"
        placeholder="E.g. Why Wiltech Labs Payroll saves small businesses time"
        (generated)="onGenerated($event)"
        (failed)="failed.emit($event)"
      />
      <ngx-text-field [fieldDef]="fields.title" [field]="postForm.title" />
      <ngx-textarea-field [fieldDef]="fields.body" [field]="postForm.body" />
    </div>
  `,
})
export class PostComposerHost {
  public readonly generated: OutputEmitterRef<AiGenerateResult> = output<AiGenerateResult>();
  public readonly failed: OutputEmitterRef<unknown> = output<unknown>();

  protected readonly fields = {
    title: { name: 'title', type: FormFieldType.TEXT, label: 'Title', maxWidth: '100%' },
    body: { name: 'body', type: FormFieldType.TEXTAREA, label: 'Post', maxWidth: '100%' },
  } satisfies Record<keyof PostModel, FieldDef>;

  private readonly model: WritableSignal<PostModel> = signal({ title: '', body: '' });
  protected readonly postForm = form(this.model, toSchema<PostModel>(Object.values(this.fields)));

  protected onGenerated(result: AiGenerateResult): void {
    this.model.set({ title: result.title, body: result.body });
    this.generated.emit(result);
  }
}
