import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ChangePasswordTopNavComponent } from "./change-password-top-nav.component";

describe("ChangePasswordTopNavComponent", () => {
	let component: ChangePasswordTopNavComponent;
	let fixture: ComponentFixture<ChangePasswordTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ChangePasswordTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ChangePasswordTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
