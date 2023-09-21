import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolSearchResultsComponent } from './school-search-results.component';

describe('SchoolSearchResultsComponent', () => {
  let component: SchoolSearchResultsComponent;
  let fixture: ComponentFixture<SchoolSearchResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchoolSearchResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
