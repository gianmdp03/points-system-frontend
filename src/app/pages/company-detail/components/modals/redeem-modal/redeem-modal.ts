import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { isFieldInvalid, getFieldError } from '../../../../../core/utils/form-utils';

@Component({
  selector: 'app-redeem-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './redeem-modal.html'
})
export class RedeemModalComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() rewardName: string = '';
  @Input() costInPoints: number = 0;
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
