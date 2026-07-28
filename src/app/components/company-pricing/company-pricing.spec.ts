import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyPricing } from './company-pricing';

describe('CompanyPricing', () => {
  let component: CompanyPricing;
  let fixture: ComponentFixture<CompanyPricing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyPricing],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyPricing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
