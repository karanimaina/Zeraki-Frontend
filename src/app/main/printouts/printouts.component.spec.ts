import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PrintoutsComponent } from "./printouts.component";

describe("PrintoutsComponent", () => {
	let component: PrintoutsComponent;
	let fixture: ComponentFixture<PrintoutsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ PrintoutsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PrintoutsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
