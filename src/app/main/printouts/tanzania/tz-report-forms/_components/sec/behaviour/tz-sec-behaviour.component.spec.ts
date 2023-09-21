import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TzSecBehaviourComponent } from './tz-sec-behaviour.component';

describe('TzSecBehaviourComponent', () => {
  let component: TzSecBehaviourComponent;
  let fixture: ComponentFixture<TzSecBehaviourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TzSecBehaviourComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TzSecBehaviourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
