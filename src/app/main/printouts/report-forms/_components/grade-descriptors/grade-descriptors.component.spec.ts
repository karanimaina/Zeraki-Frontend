import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GradeDescriptorsComponent } from "./grade-descriptors.component";

describe("GradeDescriptorsComponent", () => {
	let component: GradeDescriptorsComponent;
	let fixture: ComponentFixture<GradeDescriptorsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ GradeDescriptorsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(GradeDescriptorsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
