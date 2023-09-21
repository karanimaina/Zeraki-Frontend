import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BdevTargetsComponent } from "./bdev-targets.component";

describe("BdevTargetsComponent", () => {
	let component: BdevTargetsComponent;
	let fixture: ComponentFixture<BdevTargetsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ BdevTargetsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BdevTargetsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
