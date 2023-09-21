import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySchoolsComponent } from './my-schools.component';

describe('MySchoolsComponent', () => {
  let component: MySchoolsComponent;
  let fixture: ComponentFixture<MySchoolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MySchoolsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MySchoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
