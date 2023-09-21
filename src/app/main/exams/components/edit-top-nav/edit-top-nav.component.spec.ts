import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EditTopNavComponent } from "./edit-top-nav.component";

describe("EditTopNavComponent", () => {
	let component: EditTopNavComponent;
	let fixture: ComponentFixture<EditTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ EditTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(EditTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
