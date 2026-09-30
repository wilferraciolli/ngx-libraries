import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormFieldType } from '../../constants/form-field.constant';
import type { FieldDef } from '../../interfaces/field-definition';

const CODE_INDENT: string = '  ';

/**
 * Multi-line Material textarea for the textarea and code field types. Code is monospaced and
 * Tab indents instead of moving focus, like an editor.
 */
@Component({
  selector: 'ngx-textarea-field',
  standalone: true,
  imports: [FormField, MatFormFieldModule, MatInputModule],
  templateUrl: './textarea-field.html',
  styleUrl: './textarea-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaField {
  public readonly fieldDef = input.required<FieldDef>();
  public readonly field = input.required<FieldTree<string>>();

  protected readonly isCode = computed(() => this.fieldDef().type === FormFieldType.CODE);

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.isCode() || event.key !== 'Tab') {
      return;
    }

    event.preventDefault();

    const textarea = event.target as HTMLTextAreaElement;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const indented = `${textarea.value.substring(0, start)}${CODE_INDENT}${textarea.value.substring(end)}`;

    textarea.value = indented;
    textarea.selectionStart = textarea.selectionEnd = start + CODE_INDENT.length;
    this.field()().value.set(indented);
  }
}
