import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
  type TemplateRef,
} from '@angular/core';
import type { OrgChartNode } from 'ngx-interactive-org-chart';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import type { MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { ModalService } from '@wiltech-labs/ngx-modals';
import {
  NgxInteractiveOrgChart,
  type NgxInteractiveOrgChartTheme,
} from 'ngx-interactive-org-chart';

import { NGX_ORGANIZATION_TEXT } from '../../config/organization-text.token';
import type { OrgCard, OrgDetailContext, OrgDetailData } from '../../models/org-chart-node.model';
import type { OrgItem } from '../../models/org-item.model';
import { buildOrgTree } from '../../utils/org-tree.utils';
import { OrgNodeCard } from '../org-node-card/org-node-card';
import { OrgNodeDetail } from '../org-node-detail/org-node-detail';

/** The wrapped chart's own chrome, pointed at the app's Material 3 tokens. Cards draw themselves,
 *  so the node wrapper is reduced to a transparent hit area. */
const THEME: NgxInteractiveOrgChartTheme = {
  node: {
    background: 'transparent',
    color: 'inherit',
    shadow: 'none',
    outlineColor: 'transparent',
    outlineWidth: '0',
    activeOutlineColor: 'var(--mat-sys-primary, #6750a4)',
    highlightShadowColor: 'transparent',
    padding: '0',
    borderRadius: 'var(--mat-sys-corner-large, 16px)',
    containerSpacing: '24px',
  },
  connector: {
    color: 'var(--mat-sys-outline-variant, #cac4d0)',
    activeColor: 'var(--mat-sys-outline, #79747e)',
    borderRadius: '12px',
    width: '1.5px',
  },
  collapseButton: {
    size: '24px',
    borderColor: 'var(--mat-sys-outline-variant, #cac4d0)',
    borderRadius: '9999px',
    color: 'var(--mat-sys-on-surface-variant, #49454f)',
    background: 'var(--mat-sys-surface-container-high, #ece6f0)',
    hoverColor: 'var(--mat-sys-on-surface, #1d1b20)',
    hoverBackground: 'var(--mat-sys-surface-container-highest, #e6e0e9)',
    hoverShadow: 'none',
    hoverTransformScale: '1',
    focusOutline: '2px solid var(--mat-sys-primary, #6750a4)',
    countFontSize: '11px',
  },
  container: {
    background: 'transparent',
    border: 'none',
  },
  miniMap: {
    background: 'var(--mat-sys-surface-container, #f3edf7)',
    borderColor: 'var(--mat-sys-outline-variant, #cac4d0)',
    borderRadius: 'var(--mat-sys-corner-medium, 12px)',
    shadow: 'none',
    nodeColor: 'var(--mat-sys-outline-variant, #cac4d0)',
    viewportBackground: 'color-mix(in srgb, var(--mat-sys-primary, #6750a4) 12%, transparent)',
    viewportBorderColor: 'var(--mat-sys-primary, #6750a4)',
    viewportBorderWidth: '1.5px',
  },
};

/** The pan/zoom engine underneath the wrapped chart (`panzoom`). Not part of its typed API, so
 *  every use is guarded: a library update that moves it only loses these two refinements. */
interface PanZoom {
  moveBy(dx: number, dy: number, smooth: boolean): void;
  zoomAbs(x: number, y: number, scale: number): void;
}

/** The card drawn for `id`, anywhere in the tree (collapsed branches included). */
function findCard(node: OrgChartNode<OrgCard>, id: string): OrgCard | undefined {
  if (String(node.id) === id) return node.data;
  // The wrapped chart types children loosely; they are the same cards.
  for (const child of (node.children ?? []) as OrgChartNode<OrgCard>[]) {
    const found = findCard(child, id);
    if (found) return found;
  }
  return undefined;
}

/** Scale phones open at: the wrapped chart's fit-to-width leaves cards too small to read. */
const PHONE_SCALE = 0.8;

/** Resolves a CSS colour (tokens included) to the `rgb()` value the browser computes for it. */
function resolveColor(host: HTMLElement, color: string): string {
  const probe = document.createElement('span');
  probe.style.color = color;
  probe.style.display = 'none';
  host.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
}

/**
 * The org chart on a pan-and-zoom canvas (drag to move, wheel or pinch to zoom). Built from the
 * API's flat `items`; the API owns every structure rule. Clicking a card opens its details in an
 * `ngx-modals` panel on the left and emits `nodeSelect`.
 */
@Component({
  selector: 'ngx-organization-chart',
  standalone: true,
  imports: [NgxInteractiveOrgChart, MatIconButton, MatIcon, OrgNodeCard],
  templateUrl: './organization-chart.html',
  styleUrl: './organization-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationChart {
  public readonly items = input.required<readonly OrgItem[]>();
  /** Levels below the organization shown expanded at first; deeper cards start collapsed, so a
   *  large organization opens at a readable size. Default 2, or 1 on phones. */
  public readonly expandedDepth = input<number>();
  /** Shows the overview map in the bottom corner (never on phones, where it would cover the chart). */
  public readonly showMiniMap = input(true);

  /**
   * The app's own content for the detail panel, shown below the item's details: its actions and
   * the forms they open, say, so editing happens beside the chart instead of above it. The
   * context is the chosen item (`let-item`) and its `card`.
   */
  public readonly detailTemplate = input<TemplateRef<OrgDetailContext> | null>(null);

  /** The item behind the card the user clicked. */
  public readonly nodeSelect = output<OrgItem>();
  /** The detail panel closed (its close button, or Escape). */
  public readonly panelClose = output<void>();

  private readonly modals = inject(ModalService);
  /** The panel is created with the chart's injector, so what the page provides (a translated
   *  NGX_ORGANIZATION_TEXT, say) reaches it too. */
  private readonly injector = inject(Injector);
  private readonly resolveText = inject(NGX_ORGANIZATION_TEXT);
  private readonly chart = viewChild(NgxInteractiveOrgChart);

  private readonly compact = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 599.98px)')
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  protected readonly text = computed(() => this.resolveText());
  protected readonly tree = computed(() =>
    buildOrgTree(this.items(), this.expandedDepth() ?? (this.compact() ? 1 : 2)),
  );
  protected readonly miniMapVisible = computed(() => this.showMiniMap() && !this.compact());

  /** The card whose details are open, outlined on the chart. */
  protected readonly selectedId = signal<string | null>(null);
  private panel: MatDialogRef<unknown, unknown> | null = null;

  /** The mini map paints on a canvas, which can't read CSS variables: its card colour is resolved
   *  from the theme token here, and again when the colour scheme changes. */
  private readonly miniMapNodeColor = signal<string | undefined>(undefined);
  protected readonly theme = computed<NgxInteractiveOrgChartTheme>(() => {
    const nodeColor = this.miniMapNodeColor();
    return nodeColor ? { ...THEME, miniMap: { ...THEME.miniMap, nodeColor } } : THEME;
  });

  private readonly host: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;

  constructor() {
    const host = this.host;
    const destroyRef = inject(DestroyRef);
    // A reload (an edit saved, say) redraws the tree: the open panel stays on the same item and
    // shows it as it is now, or closes if the item is gone.
    effect(() => {
      const tree = this.tree();
      untracked(() => this.refreshPanel(tree));
    });

    afterNextRender(() => {
      // After the wrapped chart's own fit-to-screen has settled.
      const timer = setTimeout(() => this.compact() && this.focusRootOnPhone(), 400);
      destroyRef.onDestroy(() => clearTimeout(timer));
      const resolve = () =>
        this.miniMapNodeColor.set(resolveColor(host, THEME.miniMap!.nodeColor!));
      resolve();
      const scheme = matchMedia('(prefers-color-scheme: dark)');
      scheme.addEventListener('change', resolve);
      destroyRef.onDestroy(() => scheme.removeEventListener('change', resolve));
    });
  }

  protected zoomIn(): void {
    this.chart()?.zoomIn({ by: 20, relative: true });
  }

  protected zoomOut(): void {
    this.chart()?.zoomOut({ by: 20, relative: true });
  }

  protected fit(): void {
    this.chart()?.resetPanAndZoom(48);
  }

  /**
   * Shows the card's details in a modeless panel on the left: the chart stays usable beside it,
   * the panel can be minimized, and clicking another card swaps what the open panel shows.
   */
  protected open(card: OrgCard): void {
    this.nodeSelect.emit(card.item);
    this.selectedId.set(card.item.id);

    if (this.panel) {
      this.modals.update(this.panel, { title: card.item.name, data: this.detailData(card) });
      this.keepClearOfPanel(card.item.id, this.panel.id);
      return;
    }

    const panel = this.modals.open(OrgNodeDetail, {
      title: card.item.name,
      side: 'left',
      backdrop: false,
      minimizable: true,
      data: this.detailData(card),
      injector: this.injector,
    });
    this.panel = panel;
    panel.afterOpened().subscribe(() => this.keepClearOfPanel(card.item.id, panel.id));
    panel.afterClosed().subscribe(() => {
      if (this.panel !== panel) return;
      this.panel = null;
      this.selectedId.set(null);
      this.panelClose.emit();
    });
  }

  private detailData(card: OrgCard): OrgDetailData {
    return { card, template: this.detailTemplate() };
  }

  private refreshPanel(tree: OrgChartNode<OrgCard> | null): void {
    const id = this.selectedId();
    if (!this.panel || !id) return;
    const card = tree ? findCard(tree, id) : undefined;
    if (card) this.modals.update(this.panel, { title: card.item.name, data: this.detailData(card) });
    else this.panel.close();
  }

  private panZoom(): PanZoom | undefined {
    const engine = (this.chart() as unknown as { panZoomInstance?: Partial<PanZoom> } | undefined)
      ?.panZoomInstance;
    return typeof engine?.moveBy === 'function' && typeof engine.zoomAbs === 'function'
      ? (engine as PanZoom)
      : undefined;
  }

  private cardRect(id: string): DOMRect | undefined {
    const button = [...this.host.querySelectorAll<HTMLElement>('ngx-org-node-card')].find(
      (card) => card.dataset['id'] === id,
    );
    return button?.getBoundingClientRect();
  }

  /** Slides the chart right when the selected card sits under the left-hand panel. */
  private keepClearOfPanel(id: string, panelId: string): void {
    if (this.compact()) return;
    const panel = document.getElementById(panelId)?.getBoundingClientRect();
    const card = this.cardRect(id);
    if (!panel || !card || card.left >= panel.right + 24) return;
    this.panZoom()?.moveBy(panel.right + 48 - card.left, 0, true);
  }

  /** Phones: zoom to a readable scale with the organization's card at the top centre. */
  private focusRootOnPhone(): void {
    const engine = this.panZoom();
    const owner = this.host.querySelector('.org-chart-container')?.getBoundingClientRect();
    const rootId = this.tree()?.id;
    const root = rootId ? this.cardRect(String(rootId)) : undefined;
    if (!engine || !owner || !root) return;
    engine.zoomAbs(root.left + root.width / 2 - owner.left, root.top - owner.top, PHONE_SCALE);
    const zoomed = this.cardRect(String(rootId))!;
    engine.moveBy(
      owner.left + owner.width / 2 - (zoomed.left + zoomed.width / 2),
      owner.top + 24 - zoomed.top,
      false,
    );
  }
}
