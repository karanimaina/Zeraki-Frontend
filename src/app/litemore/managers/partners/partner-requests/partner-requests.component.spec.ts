import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PartnerRequestsComponent } from "./partner-requests.component";

describe("PartnerRequestsComponent", () => {
	let component: PartnerRequestsComponent;
	let fixture: ComponentFixture<PartnerRequestsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ PartnerRequestsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PartnerRequestsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
