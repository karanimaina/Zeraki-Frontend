import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GradeDescriptorComponent } from "./grade-descriptor.component";

describe("GradeDescriptorComponent", () => {
	let component: GradeDescriptorComponent;
	let fixture: ComponentFixture<GradeDescriptorComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ GradeDescriptorComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(GradeDescriptorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
