import { ComponentFixture, TestBed } from "@angular/core/testing";

import { KcseExamsComponent } from "./kcse-exams.component";

describe("KcseExamsComponent", () => {
	let component: KcseExamsComponent;
	let fixture: ComponentFixture<KcseExamsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ KcseExamsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(KcseExamsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
