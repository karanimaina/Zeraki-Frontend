import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ManageBomComponent } from "./manage-bom.component";

describe("ManageBomComponent", () => {
	let component: ManageBomComponent;
	let fixture: ComponentFixture<ManageBomComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ManageBomComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ManageBomComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
