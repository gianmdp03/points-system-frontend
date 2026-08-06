import { AbstractControl, FormGroup } from '@angular/forms';

/**
 * Returns true if a field is invalid and dirty, touched, or submitted.
 */
export function isFieldInvalid(form: FormGroup, fieldName: string, isSubmitted = false): boolean {
  const control = form.get(fieldName);
  if (!control) return false;
  return control.invalid && (control.dirty || control.touched || isSubmitted);
}

/**
 * Returns a human-friendly error message for common validation errors.
 */
export function getFieldError(form: FormGroup, fieldName: string): string {
  const control = form.get(fieldName);
  if (!control || !control.errors) return '';

  const errors = control.errors;

  if (errors['required']) {
    return 'Este campo es obligatorio.';
  }
  if (errors['email']) {
    return 'Ingresa un correo electrónico válido.';
  }
  if (errors['minlength']) {
    return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres.`;
  }
  if (errors['maxlength']) {
    return `No puede superar los ${errors['maxlength'].requiredLength} caracteres.`;
  }
  if (errors['min']) {
    return `El valor debe ser mínimo ${errors['min'].min}.`;
  }
  if (errors['max']) {
    return `El valor debe ser máximo ${errors['max'].max}.`;
  }
  if (errors['passwordMismatch']) {
    return 'Las contraseñas no coinciden.';
  }
  if (errors['pattern']) {
    return 'El formato ingresado no es válido.';
  }

  return 'Campo no válido.';
}
