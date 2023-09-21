import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BehaviourTopNavComponent } from "./behaviour-top-nav.component";

describe("BehaviourTopNavComponent", () => {
	let component: BehaviourTopNavComponent;
	let fixture: ComponentFixture<BehaviourTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ BehaviourTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BehaviourTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
