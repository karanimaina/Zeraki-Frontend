import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SendResultsConsolidatedComponent } from "./send-results-consolidated.component";

describe("SendResultsConsolidatedComponent", () => {
	let component: SendResultsConsolidatedComponent;
	let fixture: ComponentFixture<SendResultsConsolidatedComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ SendResultsConsolidatedComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SendResultsConsolidatedComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
