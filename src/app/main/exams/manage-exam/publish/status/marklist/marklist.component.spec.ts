import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarklistComponent } from "./marklist.component";

describe("MarklistComponent", () => {
	let component: MarklistComponent;
	let fixture: ComponentFixture<MarklistComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ MarklistComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MarklistComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
