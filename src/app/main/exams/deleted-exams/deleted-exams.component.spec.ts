import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DeletedExamsComponent } from "./deleted-exams.component";

describe("DeletedExamsComponent", () => {
	let component: DeletedExamsComponent;
	let fixture: ComponentFixture<DeletedExamsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ DeletedExamsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(DeletedExamsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
