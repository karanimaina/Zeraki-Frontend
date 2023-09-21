import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LeavingCertsComponent } from "./leaving-certs.component";

describe("LeavingCertsComponent", () => {
	let component: LeavingCertsComponent;
	let fixture: ComponentFixture<LeavingCertsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ LeavingCertsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LeavingCertsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
