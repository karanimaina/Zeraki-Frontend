import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SchoolMetricsComponent } from "./school-metrics.component";

describe("SchoolMetricsComponent", () => {
	let component: SchoolMetricsComponent;
	let fixture: ComponentFixture<SchoolMetricsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ SchoolMetricsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SchoolMetricsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
