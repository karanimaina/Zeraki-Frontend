import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TeacherTopNavComponent } from "./teacher-top-nav.component";

describe("TeacherTopNavComponent", () => {
	let component: TeacherTopNavComponent;
	let fixture: ComponentFixture<TeacherTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ TeacherTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TeacherTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
