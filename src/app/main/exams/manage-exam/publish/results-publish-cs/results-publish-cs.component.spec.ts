import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ResultsPublishCsComponent } from "./results-publish-cs.component";

describe("ResultsPublishCsComponent", () => {
	let component: ResultsPublishCsComponent;
	let fixture: ComponentFixture<ResultsPublishCsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ResultsPublishCsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ResultsPublishCsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
