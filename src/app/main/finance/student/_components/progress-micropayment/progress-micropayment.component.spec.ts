import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProgressMicropaymentComponent } from "./progress-micropayment.component";

describe("ProgressMicropaymentComponent", () => {
	let component: ProgressMicropaymentComponent;
	let fixture: ComponentFixture<ProgressMicropaymentComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ProgressMicropaymentComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ProgressMicropaymentComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
