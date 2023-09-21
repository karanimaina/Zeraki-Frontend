import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GradingSystemDetailsComponent } from "./grading-system-details.component";

describe("GradingSystemDetailsComponent", () => {
	let component: GradingSystemDetailsComponent;
	let fixture: ComponentFixture<GradingSystemDetailsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ GradingSystemDetailsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(GradingSystemDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
