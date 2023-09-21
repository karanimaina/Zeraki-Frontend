import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PublishSubjectStatusComponent } from "./publish-subject-status.component";

describe("PublishSubjectStatusComponent", () => {
	let component: PublishSubjectStatusComponent;
	let fixture: ComponentFixture<PublishSubjectStatusComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ PublishSubjectStatusComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PublishSubjectStatusComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
