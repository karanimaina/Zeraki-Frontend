import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PublishGuineaTermAverageComponent } from "./publish-term-average.component";

describe("PublishGuineaTermAverageComponent", () => {
	let component: PublishGuineaTermAverageComponent;
	let fixture: ComponentFixture<PublishGuineaTermAverageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ PublishGuineaTermAverageComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PublishGuineaTermAverageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
