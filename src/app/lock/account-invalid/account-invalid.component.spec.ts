import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountInvalidComponent } from './account-invalid.component';

describe('AccountInvalidComponent', () => {
  let component: AccountInvalidComponent;
  let fixture: ComponentFixture<AccountInvalidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountInvalidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountInvalidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
