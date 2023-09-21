import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TimetableTopNavComponent } from "./timetable-top-nav.component";

describe("TimetableTopNavComponent", () => {
	let component: TimetableTopNavComponent;
	let fixture: ComponentFixture<TimetableTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ TimetableTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TimetableTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
