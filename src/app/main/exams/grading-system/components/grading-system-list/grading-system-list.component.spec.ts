import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GradingSystemListComponent } from "./grading-system-list.component";

describe("GradingSystemListComponent", () => {
	let component: GradingSystemListComponent;
	let fixture: ComponentFixture<GradingSystemListComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ GradingSystemListComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(GradingSystemListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
