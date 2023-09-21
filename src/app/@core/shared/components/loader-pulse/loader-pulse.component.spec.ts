import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LoaderPulseComponent } from "./loader-pulse.component";

describe("LoaderPulseComponent", () => {
	let component: LoaderPulseComponent;
	let fixture: ComponentFixture<LoaderPulseComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ LoaderPulseComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LoaderPulseComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
