import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionUpdateModalComponent } from './region-update-modal.component';

describe('RegionUpdateModalComponent', () => {
  let component: RegionUpdateModalComponent;
  let fixture: ComponentFixture<RegionUpdateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegionUpdateModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionUpdateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
