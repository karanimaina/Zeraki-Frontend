import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ResidenceBehaviourComponent } from "./residence-behaviour.component";

describe("ResidenceBehaviourComponent", () => {
	let component: ResidenceBehaviourComponent;
	let fixture: ComponentFixture<ResidenceBehaviourComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ResidenceBehaviourComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ResidenceBehaviourComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
