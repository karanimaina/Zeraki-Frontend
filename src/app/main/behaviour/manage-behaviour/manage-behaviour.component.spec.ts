import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ManageBehaviourComponent } from "./manage-behaviour.component";

describe("ManageBehaviourComponent", () => {
	let component: ManageBehaviourComponent;
	let fixture: ComponentFixture<ManageBehaviourComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ManageBehaviourComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ManageBehaviourComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
