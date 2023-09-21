import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExamsTopNavComponent } from "./exams-top-nav.component";

describe("ExamsTopNavComponent", () => {
	let component: ExamsTopNavComponent;
	let fixture: ComponentFixture<ExamsTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ExamsTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ExamsTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
