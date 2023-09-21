import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CoefficientSystemComponent } from "./coefficient-system.component";

describe("CoefficientSystemComponent", () => {
	let component: CoefficientSystemComponent;
	let fixture: ComponentFixture<CoefficientSystemComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ CoefficientSystemComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CoefficientSystemComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
