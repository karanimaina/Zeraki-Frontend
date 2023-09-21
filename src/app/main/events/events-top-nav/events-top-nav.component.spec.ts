import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EventsTopNavComponent } from "./events-top-nav.component";

describe("EventsTopNavComponent", () => {
	let component: EventsTopNavComponent;
	let fixture: ComponentFixture<EventsTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ EventsTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(EventsTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
