import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PublishExamsComponent } from "./publish-exams.component";

describe("PublishExamsComponent", () => {
	let component: PublishExamsComponent;
	let fixture: ComponentFixture<PublishExamsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ PublishExamsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PublishExamsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
