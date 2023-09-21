import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TzSecCommentsComponent } from './tz-sec-comments.component';

describe('TzSecCommentsComponent', () => {
  let component: TzSecCommentsComponent;
  let fixture: ComponentFixture<TzSecCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TzSecCommentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TzSecCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
