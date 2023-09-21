import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountiesFiltersComponent } from './counties-filters.component';

describe('CountiesFiltersComponent', () => {
  let component: CountiesFiltersComponent;
  let fixture: ComponentFixture<CountiesFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CountiesFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CountiesFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
