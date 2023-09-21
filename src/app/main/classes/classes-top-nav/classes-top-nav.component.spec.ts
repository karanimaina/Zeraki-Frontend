import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ClassesTopNavComponent } from "./classes-top-nav.component";

describe("ClassesTopNavComponent", () => {
	let component: ClassesTopNavComponent;
	let fixture: ComponentFixture<ClassesTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ClassesTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ClassesTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
