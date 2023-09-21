import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicTopNavComponent } from './basic-top-nav.component';

describe('BasicTopNavComponent', () => {
  let component: BasicTopNavComponent;
  let fixture: ComponentFixture<BasicTopNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasicTopNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicTopNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
