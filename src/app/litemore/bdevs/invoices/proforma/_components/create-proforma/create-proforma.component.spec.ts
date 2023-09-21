import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CreateProformaComponent } from "./create-proforma.component";

describe("CreateProformaComponent", () => {
	let component: CreateProformaComponent;
	let fixture: ComponentFixture<CreateProformaComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ CreateProformaComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CreateProformaComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
