import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OldComponent } from "./old.component";

describe("OldComponent", () => {
	let component: OldComponent;
	let fixture: ComponentFixture<OldComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ OldComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(OldComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
