import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CountryStepperComponent } from "./country-stepper.component";

describe("CountryStepperComponent", () => {
	let component: CountryStepperComponent;
	let fixture: ComponentFixture<CountryStepperComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ CountryStepperComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CountryStepperComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
