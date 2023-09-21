import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PrintTopNavComponent } from "./print-top-nav.component";

describe("PrintTopNavComponent", () => {
	let component: PrintTopNavComponent;
	let fixture: ComponentFixture<PrintTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ PrintTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PrintTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
