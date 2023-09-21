import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstSetupComponent } from './first-setup.component';

describe('FirstSetupComponent', () => {
  let component: FirstSetupComponent;
  let fixture: ComponentFixture<FirstSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FirstSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
