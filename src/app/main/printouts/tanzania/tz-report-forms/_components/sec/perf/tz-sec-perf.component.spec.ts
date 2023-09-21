import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TzSecPerfComponent } from "./tz-sec-perf.component";

describe("TzSecPerfComponent", () => {
	let component: TzSecPerfComponent;
	let fixture: ComponentFixture<TzSecPerfComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ TzSecPerfComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TzSecPerfComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
