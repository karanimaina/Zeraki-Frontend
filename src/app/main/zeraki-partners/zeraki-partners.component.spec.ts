import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZerakiPartnersComponent } from './zeraki-partners.component';

describe('ZerakiPartnersComponent', () => {
  let component: ZerakiPartnersComponent;
  let fixture: ComponentFixture<ZerakiPartnersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZerakiPartnersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZerakiPartnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
