import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UserAdditionModalComponent } from "./user-addition-modal.component";

describe("UserAdditionModalComponent", () => {
	let component: UserAdditionModalComponent;
	let fixture: ComponentFixture<UserAdditionModalComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [UserAdditionModalComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UserAdditionModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
