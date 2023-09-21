import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ZlCredentialsComponent } from "./zl-credentials.component";

describe("ZlCredentialsComponent", () => {
	let component: ZlCredentialsComponent;
	let fixture: ComponentFixture<ZlCredentialsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ZlCredentialsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ZlCredentialsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
