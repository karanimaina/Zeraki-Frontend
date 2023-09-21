import { ComponentFixture, TestBed } from "@angular/core/testing";

import { InfractionsApprovalComponent } from "./infractions-approval.component";

describe("InfractionsApprovalComponent", () => {
	let component: InfractionsApprovalComponent;
	let fixture: ComponentFixture<InfractionsApprovalComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ InfractionsApprovalComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(InfractionsApprovalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
