import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AccountLockComponent } from "./account-lock.component";

describe("AccountLockComponent", () => {
	let component: AccountLockComponent;
	let fixture: ComponentFixture<AccountLockComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ AccountLockComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AccountLockComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
