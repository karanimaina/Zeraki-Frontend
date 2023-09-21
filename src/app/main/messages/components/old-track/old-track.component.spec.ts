import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OldTrackComponent } from "./old-track.component";

describe("OldTrackComponent", () => {
	let component: OldTrackComponent;
	let fixture: ComponentFixture<OldTrackComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ OldTrackComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(OldTrackComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
