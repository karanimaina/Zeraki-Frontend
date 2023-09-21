import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerAdditionComponent } from './banner-addition.component';

describe('BannerAdditionComponent', () => {
  let component: BannerAdditionComponent;
  let fixture: ComponentFixture<BannerAdditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BannerAdditionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerAdditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
