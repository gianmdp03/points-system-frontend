# Reglas y Estándares del Proyecto (Puntazos Frontend)

## Formularios
- Todos los formularios de la aplicación DEBEN implementarse exclusivamente utilizando **Angular 22 Signal Forms** (`import { form, required, email, min, pattern, FormField } from '@angular/forms/signals'`).
- Se prohíbe el uso de Template-driven forms (`[(ngModel)]`) y Reactive Forms legacy (`FormGroup` / `FormControl`) para la recolección o envío de datos en formularios.
- La fuente de verdad del formulario debe ser un `signal()` de datos.
- Las validaciones deben definirse estrictamente dentro de la propiedad `schema` del segundo argumento de la función `form()`:
  ```ts
  readonly myForm = form(this.myModel, {
    schema: (f) => {
      required(f.campo1);
      email(f.campo2);
    }
  });
  ```
- En las plantillas HTML, los controles se vinculan usando la directiva `[formField]="myForm.campo"`.
