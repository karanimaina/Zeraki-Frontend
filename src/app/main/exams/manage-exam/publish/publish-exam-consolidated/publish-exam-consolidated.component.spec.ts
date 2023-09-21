import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PublishExamConsolidatedComponent } from "./publish-exam-consolidated.component";

describe("PublishExamConsolidatedComponent", () => {
	let component: PublishExamConsolidatedComponent;
	let fixture: ComponentFixture<PublishExamConsolidatedComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ PublishExamConsolidatedComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PublishExamConsolidatedComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
