import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MessagesTopNavComponent } from "./messages-top-nav.component";

describe("MessagesTopNavComponent", () => {
	let component: MessagesTopNavComponent;
	let fixture: ComponentFixture<MessagesTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ MessagesTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MessagesTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
