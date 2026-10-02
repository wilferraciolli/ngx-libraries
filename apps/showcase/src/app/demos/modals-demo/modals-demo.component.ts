import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ModalCloseAction, ModalCloseResult, ModalService } from '@wiltech-labs/ngx-modals';

import {
  ModalsDemoContentComponent,
  ModalsDemoData,
  ModalsDemoResult,
} from './modals-demo-content.component';
import { SignupModalContentComponent, SignupModalResult } from './signup-modal-content.component';

type ApprovalResult = ModalCloseResult<ModalCloseAction, ModalsDemoResult | undefined>;
type SignupResult = ModalCloseResult<ModalCloseAction, SignupModalResult | undefined>;

@Component({
  selector: 'app-modals-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modals-demo.component.html',
  styleUrl: './modals-demo.component.scss',
})
export class ModalsDemoComponent {
  private readonly modals = inject(ModalService);

  protected readonly lastApprovalResult = signal<ApprovalResult | null>(null);
  protected readonly lastSignupResult = signal<SignupResult | null>(null);

  protected openApprovalModal(): void {
    this.modals
      .open<ApprovalResult, ModalsDemoData>(ModalsDemoContentComponent, {
        title: 'Approve holiday request',
        data: { employeeName: 'Priya Patel' },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.lastApprovalResult.set(result);
      });
  }

  protected openSignupModal(): void {
    this.modals
      .open<SignupResult>(SignupModalContentComponent, { title: 'Sign up' })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.lastSignupResult.set(result);
      });
  }
}
