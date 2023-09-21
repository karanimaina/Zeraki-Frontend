import { ComponentFixture, TestBed } from "@angular/core/testing";

import { YearAverageExamsComponent } from "./year-average-exams.component";

describe("YearAverageExamsComponent", () => {
	let component: YearAverageExamsComponent;
	let fixture: ComponentFixture<YearAverageExamsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ YearAverageExamsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(YearAverageExamsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
