import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RemarksComponent } from "./remarks.component";

describe("SectionRemarksComponent", () => {
	let component: RemarksComponent;
	let fixture: ComponentFixture<RemarksComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ RemarksComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(RemarksComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
