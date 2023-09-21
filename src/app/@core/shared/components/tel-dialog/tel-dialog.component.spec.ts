import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TelDialogComponent } from "./tel-dialog.component";

describe("TelDialogComponent", () => {
	let component: TelDialogComponent;
	let fixture: ComponentFixture<TelDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ TelDialogComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TelDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
