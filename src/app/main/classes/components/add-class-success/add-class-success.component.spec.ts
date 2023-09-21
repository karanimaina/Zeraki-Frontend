import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AddClassSuccessComponent } from "./add-class-success.component";

describe("AddClassSuccessComponent", () => {
	let component: AddClassSuccessComponent;
	let fixture: ComponentFixture<AddClassSuccessComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ AddClassSuccessComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddClassSuccessComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
