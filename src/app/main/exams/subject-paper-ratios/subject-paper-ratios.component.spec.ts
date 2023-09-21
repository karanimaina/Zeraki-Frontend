import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SubjectPaperRatiosComponent } from "./subject-paper-ratios.component";

describe("SubjectPaperRatiosComponent", () => {
	let component: SubjectPaperRatiosComponent;
	let fixture: ComponentFixture<SubjectPaperRatiosComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ SubjectPaperRatiosComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SubjectPaperRatiosComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
