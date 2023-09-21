import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BomGroupsComponent } from "./bom-groups.component";

describe("BomGroupsComponent", () => {
	let component: BomGroupsComponent;
	let fixture: ComponentFixture<BomGroupsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ BomGroupsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BomGroupsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
