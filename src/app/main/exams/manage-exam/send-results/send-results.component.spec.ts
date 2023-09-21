import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SendResultsComponent } from "./send-results.component";

describe("SendResultsComponent", () => {
	let component: SendResultsComponent;
	let fixture: ComponentFixture<SendResultsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ SendResultsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SendResultsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
