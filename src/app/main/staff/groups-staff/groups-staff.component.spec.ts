import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GroupsStaffComponent } from "./groups-staff.component";

describe("GroupsStaffComponent", () => {
	let component: GroupsStaffComponent;
	let fixture: ComponentFixture<GroupsStaffComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ GroupsStaffComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(GroupsStaffComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
