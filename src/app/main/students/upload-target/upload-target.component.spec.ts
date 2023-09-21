import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UploadTargetComponent } from "./upload-target.component";

describe("UploadTargetComponent", () => {
	let component: UploadTargetComponent;
	let fixture: ComponentFixture<UploadTargetComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ UploadTargetComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UploadTargetComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
