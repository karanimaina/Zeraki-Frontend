import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountyAdditionModalComponent } from './county-addition-modal.component';

describe('CountyAdditionModalComponent', () => {
  let component: CountyAdditionModalComponent;
  let fixture: ComponentFixture<CountyAdditionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CountyAdditionModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CountyAdditionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
