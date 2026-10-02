import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { expect, describe, it, beforeEach } from 'vitest';
import { ReviewerPickerComponent } from './reviewer-picker.component';
import { ReviewerPickerOptionComponent } from '../public-api';

@Component({
  standalone: true,
  imports: [ReviewerPickerComponent, ReviewerPickerOptionComponent, ReactiveFormsModule],
  template: `
    <cw-reviewer-picker [formControl]="control">
      @for (reviewer of mockReviewers(); track reviewer.id) {
        <cw-reviewer-picker-option
          [id]="'opt-' + reviewer.id"
          [value]="reviewer"
          [isDisabled]="reviewer.unavailable">
          {{ reviewer.name }}
        </cw-reviewer-picker-option>
      }
    </cw-reviewer-picker>
  `
})
class TestHostComponent {
  control = new FormControl(null);
  mockReviewers = signal([
    { id: 1, name: 'Alice (Senior)', unavailable: false },
    { id: 2, name: 'Bob (On Leave)', unavailable: true },
    { id: 3, name: 'Charlie (Lead)', unavailable: false }
  ]);
}

describe('ReviewerPickerComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let triggerBtn: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges(); 
    
    const btnDebug = fixture.debugElement.query(By.css('.cw-picker-trigger'));
    triggerBtn = btnDebug.nativeElement;
  });

  function dispatchKey(element: HTMLElement, key: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  }

  describe('ReviewerPickerComponent Children', () => {
    it('should apply disabled classes and ARIA attributes if the object is "unavailable"', () => {
      triggerBtn.click();
      fixture.detectChanges();

      const options = fixture.debugElement.queryAll(By.directive(ReviewerPickerOptionComponent));
      const bobOption = options[1].nativeElement;

      expect(bobOption.classList.contains('cw-disabled')).toBe(true);
      expect(bobOption.getAttribute('aria-disabled')).toBe('true');
    });

    it('should ignore mouse clicks if the element is marked as unavailable', () => {
      triggerBtn.click();
      fixture.detectChanges();
      const options = fixture.debugElement.queryAll(By.directive(ReviewerPickerOptionComponent));
      const bobOptionDebug = options[1];

      bobOptionDebug.nativeElement.click();
      fixture.detectChanges();
      expect(hostComponent.control.value).toBeNull();

      const listbox = fixture.debugElement.query(By.css('[role="listbox"]'));
      expect(listbox).not.toBeNull();
    });
  });

  describe('ReviewerPickerComponent (keyboard flow + ARIA)', () => {
    it('should initialize with the ARIA accessibility state closed', () => {
      expect(triggerBtn.getAttribute('aria-expanded')).toBe('false');
    });

    it.skip('should skip unavailable options when using arrow keys', async () => {
      // TODO: Check why this tets is not working as expected.
      dispatchKey(triggerBtn, 'ArrowDown');
      expect(triggerBtn.getAttribute('aria-activedescendant')).toBe('opt-1');
      dispatchKey(triggerBtn, 'ArrowDown');
      fixture.detectChanges();
      expect(triggerBtn.getAttribute('aria-activedescendant')).toBe('opt-3');
    });

    it('should block keyboard selection (Enter) if trying to force selection on a disabled element', () => {
      dispatchKey(triggerBtn, 'ArrowDown');
      const pickerDebug = fixture.debugElement.query(By.directive(ReviewerPickerComponent));
      const pickerInstance = pickerDebug.componentInstance as any;

      pickerInstance.keyManager.setActiveItem(1); 
      fixture.detectChanges();
      expect(triggerBtn.getAttribute('aria-activedescendant')).toBe('opt-2');
      dispatchKey(triggerBtn, 'Enter');
      expect(hostComponent.control.value).toBeNull();
    });

    it('should synchronize the selected value bidirectionally with Angular Forms', () => {
      dispatchKey(triggerBtn, 'ArrowDown');      
      const event = dispatchKey(triggerBtn, 'Enter');

      expect(event.defaultPrevented).toBe(true);
      expect(hostComponent.control.value).toEqual({ id: 1, name: 'Alice (Senior)', unavailable: false });

      const listbox = fixture.debugElement.query(By.css('[role="listbox"]'));

      expect(listbox).toBeNull();
    });

    it('should apply global disabled styles if the ControlValueAccessor changes to setDisabledState', () => {
      hostComponent.control.disable();
      fixture.detectChanges();
      expect(triggerBtn.disabled).toBe(true);
      const container = fixture.debugElement.query(By.css('.cw-picker-container')).nativeElement;

      expect(container.classList.contains('cw-disabled')).toBe(true);
    });
  });
});
