import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LitemoreListPaginationComponent } from './litemore-list-pagination.component';

describe('LitemoreListPaginationComponent', () => {
  let component: LitemoreListPaginationComponent;
  let fixture: ComponentFixture<LitemoreListPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LitemoreListPaginationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LitemoreListPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
