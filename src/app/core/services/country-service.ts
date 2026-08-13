import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError, map } from 'rxjs';
import { ALL_COUNTRIES, Country } from '../constants/countries';

export type { Country } from '../constants/countries';

interface RawCountryItem {
  name?: { common?: string };
  translations?: { spa?: { common?: string } };
  cca2?: string;
  flag?: string;
}

const CACHE_KEY = 'pointly_countries_cache_v2';
const CACHE_TIME_KEY = 'pointly_countries_cache_time_v2';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const REMOTE_COUNTRIES_URL = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private readonly http = inject(HttpClient);

  // Inicializado de inmediato con los 250 países del mundo
  readonly countries = signal<Country[]>(ALL_COUNTRIES);
  readonly isLoading = signal<boolean>(false);

  constructor() {
    this.initCountries();
  }

  /**
   * Inicializa los países desde localStorage o API
   */
  private initCountries(): void {
    const cached = this.getValidCache();
    if (cached && cached.length > 50) {
      this.countries.set(cached);
      if (this.isCacheExpired()) {
        this.fetchFromApi().subscribe();
      }
    } else {
      this.countries.set(ALL_COUNTRIES);
      this.fetchFromApi().subscribe();
    }
  }

  /**
   * Consulta el repositorio de países para detectar nuevos países geopolíticos
   */
  fetchFromApi(): Observable<Country[]> {
    this.isLoading.set(true);

    return this.http.get<RawCountryItem[]>(REMOTE_COUNTRIES_URL).pipe(
      map((response) => this.mapAndSortCountries(response)),
      tap((mapped) => {
        if (mapped && mapped.length > 50) {
          this.countries.set(mapped);
          this.saveToCache(mapped);
        }
        this.isLoading.set(false);
      }),
      catchError(() => {
        this.isLoading.set(false);
        // Si falla la red, mantenemos los 250 países de base
        if (this.countries().length === 0) {
          this.countries.set(ALL_COUNTRIES);
        }
        return of(this.countries());
      })
    );
  }

  private mapAndSortCountries(data: RawCountryItem[]): Country[] {
    if (!Array.isArray(data) || data.length === 0) return ALL_COUNTRIES;

    const list: Country[] = data
      .map((item) => {
        const spanishName = item.translations?.spa?.common || item.name?.common || '';
        return {
          name: spanishName.trim(),
          code: (item.cca2 || '').toUpperCase(),
          flag: item.flag || '🏳️'
        };
      })
      .filter((c) => c.name.length > 0 && c.code.length > 0);

    return list.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }

  private getValidCache(): Country[] | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 50 ? parsed : null;
    } catch {
      return null;
    }
  }

  private isCacheExpired(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return true;
      const timeRaw = localStorage.getItem(CACHE_TIME_KEY);
      if (!timeRaw) return true;
      const savedTime = Number(timeRaw);
      return Date.now() - savedTime > SEVEN_DAYS_MS;
    } catch {
      return true;
    }
  }

  private saveToCache(countries: Country[]): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.setItem(CACHE_KEY, JSON.stringify(countries));
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
    } catch {
      // Ignorar quota storage
    }
  }
}
