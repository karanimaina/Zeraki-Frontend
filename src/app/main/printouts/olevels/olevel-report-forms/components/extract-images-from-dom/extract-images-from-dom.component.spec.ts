import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExtractImagesFromDomComponent } from "./extract-images-from-dom.component";

describe("ExtractImagesFromDomComponent", () => {
	let component: ExtractImagesFromDomComponent;
	let fixture: ComponentFixture<ExtractImagesFromDomComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ExtractImagesFromDomComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ExtractImagesFromDomComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
