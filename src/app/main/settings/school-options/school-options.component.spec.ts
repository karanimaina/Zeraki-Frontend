import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SchoolOptionsComponent } from "./school-options.component";

describe("SchoolOptionsComponent", () => {
	let component: SchoolOptionsComponent;
	let fixture: ComponentFixture<SchoolOptionsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ SchoolOptionsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SchoolOptionsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
