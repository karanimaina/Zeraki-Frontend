import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SchoolsFiltersComponent } from "./schools-filters.component";

describe("SchoolsFiltersComponent", () => {
	let component: SchoolsFiltersComponent;
	let fixture: ComponentFixture<SchoolsFiltersComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SchoolsFiltersComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SchoolsFiltersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
