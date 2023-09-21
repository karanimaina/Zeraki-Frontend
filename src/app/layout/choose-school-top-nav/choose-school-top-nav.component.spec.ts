import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SchoolTopNavComponent } from "./choose-school-top-nav.component";

describe("SchoolTopNavComponent", () => {
	let component: SchoolTopNavComponent;
	let fixture: ComponentFixture<SchoolTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SchoolTopNavComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SchoolTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
