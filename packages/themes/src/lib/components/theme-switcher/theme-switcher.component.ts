import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { MatTooltip } from '@angular/material/tooltip';

import { NGX_THEMES_TEXT } from '../../config/themes-text.token.js';
import { ThemeService } from '../../services/theme.service.js';

/** Navbar control: one click flips light/dark; the palette menu picks the family, or hands the
 *  mode back to the OS ("Match system"). With no families configured, the menu holds only
 *  "Match system". */
@Component({
  selector: 'ngx-theme-switcher',
  standalone: true,
  imports: [MatIconButton, MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, MatDivider, MatTooltip],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcher {
  protected readonly theme = inject(ThemeService);
  protected readonly text = inject(NGX_THEMES_TEXT);
}
