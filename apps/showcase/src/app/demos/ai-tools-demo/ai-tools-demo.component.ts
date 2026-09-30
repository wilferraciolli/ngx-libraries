import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiButton, AiPanel, AiSparkleIcon, AiTextBox } from '@wiltech-labs/ngx-ai-tools';

@Component({
  selector: 'app-ai-tools-demo',
  standalone: true,
  imports: [CommonModule, AiPanel, AiTextBox, AiButton, AiSparkleIcon],
  templateUrl: './ai-tools-demo.component.html',
  styleUrls: ['./ai-tools-demo.component.css'],
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
}
