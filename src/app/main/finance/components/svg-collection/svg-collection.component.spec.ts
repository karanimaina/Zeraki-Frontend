import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SvgCollectionComponent } from "./svg-collection.component";

xdescribe("SvgCollectionComponent", () => {
	let component: SvgCollectionComponent;
	let fixture: ComponentFixture<SvgCollectionComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ SvgCollectionComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SvgCollectionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
