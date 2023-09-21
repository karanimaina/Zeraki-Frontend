import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BdevsComponent } from "./bdevs.component";

describe("LitemoreBdevComponent", () => {
	let component: BdevsComponent;
	let fixture: ComponentFixture<BdevsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ BdevsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BdevsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
