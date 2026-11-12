import { Component, signal } from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import {
  AiButton,
  AiGenerate,
  AiPanel,
  AiSparkleIcon,
  AiTextBox,
  provideAiGenerator,
} from '@wiltech-labs/ngx-ai-tools';
import type { AiGenerateResult } from '@wiltech-labs/ngx-ai-tools';
import { FormFieldType, TextField, TextareaField, toSchema } from '@wiltech-labs/ngx-forms';
import type { FieldDef } from '@wiltech-labs/ngx-forms';
import { createFakeAiGenerator } from './fake-ai-generator';

interface PostModel {
  title: string;
  body: string;
}

const COPIED_RESET_MS: number = 2000;

@Component({
  selector: 'app-ai-tools-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    AiPanel,
    AiTextBox,
    AiButton,
    AiSparkleIcon,
    AiGenerate,
    TextField,
    TextareaField,
  ],
  providers: [provideAiGenerator(createFakeAiGenerator)],
  templateUrl: './ai-tools-demo.component.html',
  styleUrl: './ai-tools-demo.component.scss',
})
export class AiToolsDemoComponent {
  prompt = signal('');
  generating = signal(false);
  result = signal<string | null>(null);

  generate() {
    this.generating.set(true);
    this.result.set(null);
    setTimeout(() => {
      this.result.set(`Generated response for: "${this.prompt()}"`);
      this.generating.set(false);
    }, 800);
  }

  // Post composer: AiGenerate fills two plain ngx-forms fields, which stay editable.
  protected readonly postFields = {
    title: { name: 'title', type: FormFieldType.TEXT, label: 'Title', maxWidth: '100%' },
    body: {
      name: 'body',
      type: FormFieldType.TEXTAREA,
      label: 'Post',
      maxWidth: '100%',
      hint: 'Edit freely before copying.',
    },
  } satisfies Record<keyof PostModel, FieldDef>;

  protected readonly postModel: WritableSignal<PostModel> = signal({ title: '', body: '' });
  protected readonly postForm = form(
    this.postModel,
    toSchema<PostModel>(Object.values(this.postFields)),
  );
  protected readonly copied: WritableSignal<boolean> = signal(false);

  protected onGenerated(result: AiGenerateResult): void {
    this.postModel.set({ title: result.title, body: result.body });
  }

  protected async copyPost(): Promise<void> {
    const { title, body }: PostModel = this.postModel();
    await navigator.clipboard.writeText([title, body].filter(Boolean).join('\n\n'));
    this.copied.set(true);
    setTimeout((): void => this.copied.set(false), COPIED_RESET_MS);
  }
}
