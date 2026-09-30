import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ModalCloseAction, ModalCloseResult, ModalContent } from '@wiltech-labs/ngx-modals';

export interface SignupModalResult {
  name: string;
  email: string;
  agreedToTerms: boolean;
}

type DialogResult = ModalCloseResult<ModalCloseAction, SignupModalResult | undefined>;

/**
 * Second `ModalService.open()` scenario in the showcase: a plain form (name, email, agree-to-terms)
 * instead of the first scenario's read-mostly approve/reject flow — demonstrates getting a typed
 * value *back out* of the modal on close, via the same `MatDialogRef.close(result)` mechanism
 * `hasUnsavedChanges()`'s dirty-check guards.
 */
@Component({
  selector: 'app-signup-modal-content',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './signup-modal-content.component.html',
})
export class SignupModalContentComponent implements ModalContent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<SignupModalContentComponent, DialogResult>);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    agreedToTerms: [false, Validators.requiredTrue],
  });

  hasUnsavedChanges(): boolean {
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
