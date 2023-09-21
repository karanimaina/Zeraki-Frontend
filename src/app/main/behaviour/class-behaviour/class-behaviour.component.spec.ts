import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ClassBehaviourComponent } from "./class-behaviour.component";

describe("ClassBehaviourComponent", () => {
	let component: ClassBehaviourComponent;
	let fixture: ComponentFixture<ClassBehaviourComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ClassBehaviourComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ClassBehaviourComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
