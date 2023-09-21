import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StaffNavTopComponent } from "./staff-nav-top.component";

describe("StaffNavTopComponent", () => {
	let component: StaffNavTopComponent;
	let fixture: ComponentFixture<StaffNavTopComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ StaffNavTopComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StaffNavTopComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
