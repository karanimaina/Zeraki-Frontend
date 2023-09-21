import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StudentsTopNavComponent } from "./students-top-nav.component";

describe("StudentsTopNavComponent", () => {
	let component: StudentsTopNavComponent;
	let fixture: ComponentFixture<StudentsTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ StudentsTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StudentsTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
