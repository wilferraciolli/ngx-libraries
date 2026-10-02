import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form } from '@angular/forms/signals';
import { BaseSchema, DynamicForm, FieldDef, SchemaConfig, toSchema } from '@wiltech-labs/ngx-forms';

/**
 * Wraps `DynamicForm` with the `form()`/entity signal wiring every story needs — `DynamicForm`
 * takes a `FieldTree`, which only exists once a schema and a model signal are paired up, so a
 * plain `args` object can't drive it the way it drives a single field component. Every
 * `DynamicForm` story in this folder renders through this host, passing a `SchemaConfig` built
 * with `formConfig()`.
 */
@Component({
  selector: 'sb-dynamic-form-host',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="Story-stack">
      <ngx-dynamic-form
        [metaInfo]="schemaConfig().fields"
        [dynamicForm]="formTree"
        [submitLabel]="submitLabel()"
        [clearLabel]="clearLabel()"
        (onFormSubmit)="submitted.set(entity())"
        (onFormClear)="submitted.set(null)"
      />
      <pre class="Story-output">value = {{ entity() | json }}</pre>
      @if (submitted(); as data) {
        <pre class="Story-output">submitted = {{ data | json }}</pre>
      }
    </div>
  `,
})
export class DynamicFormHost<T extends BaseSchema> {
  public readonly schemaConfig = input.required<SchemaConfig<T>>();
  public readonly submitLabel = input('Save');
  public readonly clearLabel = input('Clear');

  protected readonly entity = signal<T>(this.schemaConfig().initialValue as T);
  protected readonly formTree = form(this.entity, toSchema<T>(this.schemaConfig().fields) as never);
  protected readonly submitted = signal<T | null>(null);
}
