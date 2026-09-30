import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ModalCloseAction, ModalCloseResult, ModalService } from '@wiltech-labs/ngx-modals';

import { ModalsDemoContentComponent, ModalsDemoData, ModalsDemoResult } from './modals-demo-content.component';

type DemoResult = ModalCloseResult<ModalCloseAction, ModalsDemoResult | undefined>;

@Component({
  selector: 'app-modals-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modals-demo.component.html',
  styleUrls: ['./modals-demo.component.css']
})
export class ModalsDemoComponent {
  private readonly modals = inject(ModalService);

  protected readonly lastResult = signal<DemoResult | null>(null);

  protected openModal(): void {
    this.modals
      .open<DemoResult, ModalsDemoData>(ModalsDemoContentComponent, {
        title: 'Approve holiday request',
        data: { employeeName: 'Priya Patel' }
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.lastResult.set(result);
      });
  }
}
