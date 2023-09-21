import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UploadExamsSubjectComponent } from "./upload-exams-subject.component";

describe("UploadExamsSubjectComponent", () => {
	let component: UploadExamsSubjectComponent;
	let fixture: ComponentFixture<UploadExamsSubjectComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ UploadExamsSubjectComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UploadExamsSubjectComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
