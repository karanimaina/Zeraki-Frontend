import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SettingsTopNavComponent } from "./settings-top-nav.component";

describe("SettingsTopNavComponent", () => {
	let component: SettingsTopNavComponent;
	let fixture: ComponentFixture<SettingsTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ SettingsTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SettingsTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
