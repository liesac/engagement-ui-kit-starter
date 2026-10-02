import { Component, Input } from '@angular/core';

/**
 * Shows the processing state of an engagement.
 *
 * Usage:
 * ```html
 * <cw-status-badge label="Ready" [isReady]="true"></cw-status-badge>
 * ```
 */
@Component({
  selector: 'cw-status-badge',
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
  @Input() label = '';
  @Input() isReady = false;
  @Input() isProcessing = false;
  @Input() isError = false;
  @Input() isSmall = false;
  @Input() isLarge = false;
  @Input() tooltip = '';
}
