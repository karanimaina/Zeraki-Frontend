import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GradingSystemAdditionComponent } from "./grading-system-addition.component";

describe("GradingSystemAdditionComponent", () => {
	let component: GradingSystemAdditionComponent;
	let fixture: ComponentFixture<GradingSystemAdditionComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ GradingSystemAdditionComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(GradingSystemAdditionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
