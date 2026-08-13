import {
  Component,
  Input,
  ElementRef,
  HostListener,
  forwardRef,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CountryService, Country } from '../../core/services/country-service';

@Component({
  selector: 'app-country-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './country-select.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CountrySelectComponent),
      multi: true
    }
  ],
  host: {
    class: 'block relative'
  }
})
export class CountrySelectComponent implements ControlValueAccessor {
  private readonly countryService = inject(CountryService);
  private readonly elementRef = inject(ElementRef);

  @Input() label: string = 'País';
  @Input() placeholder: string = 'Seleccionar país...';
  @Input() hasError: boolean = false;
  @Input() errorMessage: string | null = null;
  @Input() required: boolean = true;
  @Input() disabled: boolean = false;

  readonly isOpen = signal<boolean>(false);
  readonly searchTerm = signal<string>('');
  readonly selectedCountryName = signal<string>('Argentina');

  // Países provistos por el CountryService
  readonly allCountries = this.countryService.countries;
  readonly isLoading = this.countryService.isLoading;

  // Filtro de búsqueda en tiempo real
  readonly filteredCountries = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.allCountries();
    if (!term) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term)
    );
  });

  // País seleccionado actual
  readonly currentSelectedCountry = computed(() => {
    const name = this.selectedCountryName();
    return this.allCountries().find((c) => c.name.toLowerCase() === name.toLowerCase()) || null;
  });

  // ControlValueAccessor callbacks
  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    if (value) {
      this.selectedCountryName.set(value);
    }
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    const nextState = !this.isOpen();
    this.isOpen.set(nextState);
    if (nextState) {
      this.searchTerm.set('');
      // Auto-focus search input after tick
      setTimeout(() => {
        const searchInput = this.elementRef.nativeElement.querySelector('#country-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 50);
    } else {
      this.onTouched();
    }
  }

  selectCountry(country: Country): void {
    this.selectedCountryName.set(country.name);
    this.onChange(country.name);
    this.onTouched();
    this.isOpen.set(false);
    this.searchTerm.set('');
  }

  clearSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.searchTerm.set('');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isOpen()) {
        this.isOpen.set(false);
        this.onTouched();
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.onTouched();
    }
  }
}
