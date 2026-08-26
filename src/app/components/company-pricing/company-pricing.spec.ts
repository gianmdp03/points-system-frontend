import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { CompanyPricing } from './company-pricing';

describe('CompanyPricing', () => {
  let component: CompanyPricing;
  let fixture: ComponentFixture<CompanyPricing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyPricing],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyPricing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
