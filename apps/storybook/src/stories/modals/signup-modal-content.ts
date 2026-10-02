import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ModalCloseAction, ModalCloseResult, ModalContent } from '@wiltech-labs/ngx-modals';

export interface SignupResult {
  name: string;
  email: string;
}

type DialogResult = ModalCloseResult<ModalCloseAction, SignupResult | undefined>;

/** A plain reactive form as modal content — shows getting a typed value back out via `close()`,
 *  and the unsaved-changes guard firing from `form.dirty` instead of a single flag. */
@Component({
  selector: 'sb-signup-modal-content',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="Story-stack" style="padding: 16px" [formGroup]="form" (ngSubmit)="submit()">
      <mat-form-field>
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" />
      </mat-form-field>
      <div class="Story-row">
        <button mat-raised-button color="primary" type="submit">Sign up</button>
        <button mat-button type="button" (click)="cancel()">Cancel</button>
      </div>
    </form>
  `,
})
export class SignupModalContent implements ModalContent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<SignupModalContent, DialogResult>);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  public hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ action: ModalCloseAction.Created, data: this.form.getRawValue() });
  }

  protected cancel(): void {
    this.dialogRef.close({ action: ModalCloseAction.Cancelled, data: undefined });
  }
}
