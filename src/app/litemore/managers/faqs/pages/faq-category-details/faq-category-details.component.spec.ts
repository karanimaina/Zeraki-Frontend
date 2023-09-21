import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqCategoryDetailsComponent } from "./faq-category-details.component";

describe("FaqCategoryDetailsComponent", () => {
	let component: FaqCategoryDetailsComponent;
	let fixture: ComponentFixture<FaqCategoryDetailsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ FaqCategoryDetailsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(FaqCategoryDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
