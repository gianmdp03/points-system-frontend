import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UserInfo } from './user-info';

describe('UserInfo', () => {
  let component: UserInfo;
  let fixture: ComponentFixture<UserInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInfo],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
