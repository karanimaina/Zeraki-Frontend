import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GradClassesComponent } from "./grad-classes.component";

describe("GradClassesComponent", () => {
	let component: GradClassesComponent;
	let fixture: ComponentFixture<GradClassesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ GradClassesComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(GradClassesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
