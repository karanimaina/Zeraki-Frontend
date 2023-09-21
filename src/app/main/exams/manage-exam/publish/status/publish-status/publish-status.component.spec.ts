import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PublishStatusComponent } from "./publish-status.component";

describe("PublishStatusComponent", () => {
	let component: PublishStatusComponent;
	let fixture: ComponentFixture<PublishStatusComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ PublishStatusComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PublishStatusComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
