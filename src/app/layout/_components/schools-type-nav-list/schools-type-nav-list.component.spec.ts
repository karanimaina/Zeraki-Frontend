import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolsTypeNavListComponent } from './schools-type-nav-list.component';

describe('SchoolsTypeNavListComponent', () => {
  let component: SchoolsTypeNavListComponent;
  let fixture: ComponentFixture<SchoolsTypeNavListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchoolsTypeNavListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolsTypeNavListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
