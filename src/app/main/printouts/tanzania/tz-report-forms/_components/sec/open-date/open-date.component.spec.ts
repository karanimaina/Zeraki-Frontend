import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenDateComponent } from './open-date.component';

describe('OpenDateComponent', () => {
  let component: OpenDateComponent;
  let fixture: ComponentFixture<OpenDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenDateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
