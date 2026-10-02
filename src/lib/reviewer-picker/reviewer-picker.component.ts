import { Component, forwardRef, contentChildren, signal, HostListener, inject, Injector } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ReviewerPickerOptionComponent } from './picker-option/reviewer-picker-option.component';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { ReviewerOption } from '../../app/data/engagement-fixtures';

@Component({
  selector: 'cw-reviewer-picker',
  standalone: true,
  templateUrl: './reviewer-picker.component.html',
  styleUrls: ['./reviewer-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReviewerPickerComponent),
      multi: true
    }
  ]
})
export class ReviewerPickerComponent implements ControlValueAccessor {
  protected activeOptionIndex = signal<number>(-1);
  protected readonly optionElements = contentChildren(ReviewerPickerOptionComponent);
  protected activeOptionId = signal<string>('');
  private onChange: (value: ReviewerOption | null) => void = () => {};
  private onTouched: () => void = () => {};
  private uniqueId = Math.random().toString(36).substring(2, 9);
  protected labelId = `cw-label-${this.uniqueId}`;
  protected triggerId = `cw-trigger-${this.uniqueId}`;
  protected listboxId = `cw-listbox-${this.uniqueId}`;
  private readonly injector = inject(Injector);
  private readonly keyManager: ActiveDescendantKeyManager<ReviewerPickerOptionComponent> = new ActiveDescendantKeyManager(
    this.optionElements,
    this.injector
  )
    .withWrap()
    .withTypeAhead(300)
    .skipPredicate(option => option.disabled);
  readonly valueSignal = signal<ReviewerOption | null>(null);
  protected readonly isDisabled = signal<boolean>(false);
  protected readonly isOpen = signal<boolean>(false);

  constructor() {
    this.keyManager.change.subscribe(() => {
      const activeItem = this.keyManager.activeItem;
      this.activeOptionId.set(activeItem ? activeItem.id() : '');
    });
  }

  closeDropdown(): void {
    this.isOpen.set(false);
    this.onTouched();
  }

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;

    if (!this.isOpen()) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        this.openDropdown();
        return;
      }
    }

    if (this.isOpen()) {
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (this.keyManager.activeItem && !this.keyManager.activeItem.disabled) {
            this.selectOption(this.keyManager.activeItem.value());
          }
          break;
        case 'Escape':
        case 'Tab':
          this.closeDropdown();
          break;
        default:
          this.keyManager.onKeydown(event);
          break;
      }
    }
  }

  markAsTouched(): void {
    this.onTouched();
  }

  openDropdown(): void {
    this.isOpen.set(true);

    if (this.valueSignal()) {
      const index = this.optionElements().findIndex(opt => opt.value().id === this.valueSignal()?.id);
      if (index >= 0) {
        this.keyManager.setActiveItem(index);
        return;
      }
    }

    this.keyManager.setFirstItemActive();
  }

  registerOnChange(fn: (value: ReviewerOption | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  selectOption(option: ReviewerOption): void {
    if (this.isDisabled()) return;

    this.valueSignal.set(option);
    this.onChange(option);
    this.closeDropdown();
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  toggleDropdown(): void {
    if (this.isDisabled()) return;

    if (this.isOpen()) {
      this.closeDropdown();
      return;
    }

    this.openDropdown();
  }

  writeValue(value: ReviewerOption): void {
    this.valueSignal.set(value);
  }
}
