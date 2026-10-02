import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ReviewerPickerComponent, ReviewerPickerOptionComponent, StatusBadge } from '../lib/public-api';
import { CHANGE_GROUPS, ENGAGEMENTS, ReviewerOption, REVIEWERS } from './data/engagement-fixtures';

/**
 * The workbench: a consumer of the kit in `src/lib`.
 *
 * It exists so components can be built, demonstrated and reviewed in a running
 * application. Change it freely — it is a consumer, not part of the kit.
 */
@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    ReviewerPickerComponent,
    ReviewerPickerOptionComponent,
    StatusBadge
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly engagements = ENGAGEMENTS;
  protected readonly reviewers = REVIEWERS;
  protected readonly changeGroups = CHANGE_GROUPS;

  /** A form control for the reviewer filter, ready for a form-integrated control. */
  protected readonly reviewer = new FormControl<ReviewerOption | null>(null);

  reviewersForm = new FormGroup({
    reviewer: this.reviewer
  });
}
