import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UploadFeeComponent } from "./upload-fee.component";

describe("UploadFeeComponent", () => {
	let component: UploadFeeComponent;
	let fixture: ComponentFixture<UploadFeeComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ UploadFeeComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UploadFeeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
