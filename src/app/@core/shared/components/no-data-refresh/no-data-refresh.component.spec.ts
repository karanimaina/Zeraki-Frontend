import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NoDataRefreshComponent } from "./no-data-refresh.component";

describe("NoDataRefreshComponent", () => {
	let component: NoDataRefreshComponent;
	let fixture: ComponentFixture<NoDataRefreshComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ NoDataRefreshComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(NoDataRefreshComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
