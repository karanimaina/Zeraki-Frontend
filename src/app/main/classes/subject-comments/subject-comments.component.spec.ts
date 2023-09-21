import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SubjectCommentsComponent } from "./subject-comments.component";

describe("SubjectCommentsComponent", () => {
	let component: SubjectCommentsComponent;
	let fixture: ComponentFixture<SubjectCommentsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ SubjectCommentsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SubjectCommentsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
