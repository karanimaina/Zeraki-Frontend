import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LitemoreComponent } from "./litemore.component";

describe("LitemoreComponent", () => {
	let component: LitemoreComponent;
	let fixture: ComponentFixture<LitemoreComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ LitemoreComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LitemoreComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
