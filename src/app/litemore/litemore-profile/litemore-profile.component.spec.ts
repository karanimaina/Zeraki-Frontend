import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LitemoreProfileComponent } from "./litemore-profile.component";

describe("LitemoreProfileComponent", () => {
	let component: LitemoreProfileComponent;
	let fixture: ComponentFixture<LitemoreProfileComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ LitemoreProfileComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LitemoreProfileComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
