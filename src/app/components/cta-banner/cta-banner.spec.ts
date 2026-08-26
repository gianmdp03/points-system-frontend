import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CtaBanner } from './cta-banner';

describe('CtaBanner', () => {
  let component: CtaBanner;
  let fixture: ComponentFixture<CtaBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtaBanner],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CtaBanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
