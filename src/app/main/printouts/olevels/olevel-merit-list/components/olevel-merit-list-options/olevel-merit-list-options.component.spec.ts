import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OlevelMeritListOptionsComponent } from "./olevel-merit-list-options.component";

describe("OlevelMeritListOptionsComponent", () => {
	let component: OlevelMeritListOptionsComponent;
	let fixture: ComponentFixture<OlevelMeritListOptionsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ OlevelMeritListOptionsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(OlevelMeritListOptionsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
