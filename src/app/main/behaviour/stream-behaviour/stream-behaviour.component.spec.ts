import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StreamBehaviourComponent } from "./stream-behaviour.component";

describe("StreamBehaviourComponent", () => {
	let component: StreamBehaviourComponent;
	let fixture: ComponentFixture<StreamBehaviourComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ StreamBehaviourComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StreamBehaviourComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
