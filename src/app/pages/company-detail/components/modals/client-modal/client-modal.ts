import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { isFieldInvalid, getFieldError } from '../../../../../core/utils/form-utils';
import { CountrySelectComponent } from '../../../../../components/country-select/country-select';

@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CountrySelectComponent],
  templateUrl: './client-modal.html'
})
export class ClientModalComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() isSubmitted: boolean = false;
  @Input() errorMessage: string | null = null;
  @Input() isLoading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<void>();

  readonly isFieldInvalid = isFieldInvalid;
  readonly getFieldError = getFieldError;
}
