import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TzSecGradesComponent } from "./tz-sec-grades.component";

describe("TzSecGradesComponent", () => {
	let component: TzSecGradesComponent;
	let fixture: ComponentFixture<TzSecGradesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ TzSecGradesComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TzSecGradesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
