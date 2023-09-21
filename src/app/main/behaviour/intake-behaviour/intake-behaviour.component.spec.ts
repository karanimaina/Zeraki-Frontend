import { ComponentFixture, TestBed } from "@angular/core/testing";

import { IntakeBehaviourComponent } from "./intake-behaviour.component";

describe("IntakeBehaviourComponent", () => {
	let component: IntakeBehaviourComponent;
	let fixture: ComponentFixture<IntakeBehaviourComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ IntakeBehaviourComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(IntakeBehaviourComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
