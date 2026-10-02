import { Component, Input, HostBinding, signal, input, inject, HostListener } from '@angular/core';
import { Highlightable } from '@angular/cdk/a11y';
import { ReviewerPickerComponent } from '../reviewer-picker.component';

@Component({
  selector: 'cw-reviewer-picker-option',
  standalone: true,
  templateUrl: './reviewer-picker-option.component.html',
  styleUrls: ['./reviewer-picker-option.component.scss'],
  host: {
    'role': 'option',
    '[id]': 'id()',
    '[attr.aria-selected]': 'isSelected()',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[class.cw-disabled]': 'isDisabled()'
  }
})
export class ReviewerPickerOptionComponent implements Highlightable {
  private parentPicker = inject(ReviewerPickerComponent);
  id = input.required<string>();
  value = input.required<any>();
  isDisabled = input<boolean>(false);

  
  private readonly _isActive = signal<boolean>(false);
  
  protected isSelected = () => {
    return this.parentPicker.valueSignal()?.id === this.value()?.id;
  };
  
  get disabled(): boolean {
    return this.isDisabled();
  }

  @HostBinding('class.cw-active') get isActive() {
    return this._isActive();
  }

  getLabel?(): string {
    return this.value()?.name || '';
  }

  @HostListener('click')
  protected handleClick(): void {
    if (!this.isDisabled()) {
      this.parentPicker.selectOption(this.value());
    }
  }

  setActiveStyles(): void {
    this._isActive.set(true);
  }

  setInactiveStyles(): void {
    this._isActive.set(false);
  }
}
