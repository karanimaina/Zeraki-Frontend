import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountyUpdateModalComponent } from './county-update-modal.component';

describe('CountyUpdateModalComponent', () => {
  let component: CountyUpdateModalComponent;
  let fixture: ComponentFixture<CountyUpdateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CountyUpdateModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CountyUpdateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
