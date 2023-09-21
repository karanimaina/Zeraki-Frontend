import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqCategoriesListComponent } from "./faq-categories-list.component";

describe("FaqCategoriesListComponent", () => {
	let component: FaqCategoriesListComponent;
	let fixture: ComponentFixture<FaqCategoriesListComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ FaqCategoriesListComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(FaqCategoriesListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
