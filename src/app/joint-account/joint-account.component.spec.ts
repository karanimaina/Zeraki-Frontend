import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JointAccountComponent } from './joint-account.component';

describe('JointAccountComponent', () => {
  let component: JointAccountComponent;
  let fixture: ComponentFixture<JointAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JointAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JointAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
