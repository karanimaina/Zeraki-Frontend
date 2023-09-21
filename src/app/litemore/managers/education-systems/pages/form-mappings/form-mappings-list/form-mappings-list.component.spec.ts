import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FormMappingsListComponent } from "./form-mappings-list.component";

describe("FormMappingsListComponent", () => {
	let component: FormMappingsListComponent;
	let fixture: ComponentFixture<FormMappingsListComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ FormMappingsListComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(FormMappingsListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
