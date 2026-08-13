import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { isFieldInvalid, getFieldError } from '../../../../../core/utils/form-utils';

@Component({
  selector: 'app-sale-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sale-modal.html'
})
export class SaleModalComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) isEdit: boolean = false;
  @Input() isSubmitted: boolean = false;
  @Input() errorMessage: string | null = null;
  @Input() isLoading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<void>();

  readonly isFieldInvalid = isFieldInvalid;
  readonly getFieldError = getFieldError;

  readonly countries = [
    'Argentina',
    'Chile',
    'Uruguay',
    'Paraguay',
    'Brasil',
    'México',
    'Colombia',
    'Perú',
    'España',
    'Estados Unidos'
  ];
}
