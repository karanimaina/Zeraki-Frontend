import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionAdditionModalComponent } from './region-addition-modal.component';

describe('RegionAdditionModalComponent', () => {
  let component: RegionAdditionModalComponent;
  let fixture: ComponentFixture<RegionAdditionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegionAdditionModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionAdditionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
