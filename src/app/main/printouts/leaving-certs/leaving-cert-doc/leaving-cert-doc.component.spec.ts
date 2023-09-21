import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LeavingCertDocComponent } from "./leaving-cert-doc.component";

describe("LeavingCertDocComponent", () => {
	let component: LeavingCertDocComponent;
	let fixture: ComponentFixture<LeavingCertDocComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ LeavingCertDocComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LeavingCertDocComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
