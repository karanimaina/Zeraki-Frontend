import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LetterHeadComponent } from "./letter-head.component";

describe("LetterHeadComponent", () => {
	let component: LetterHeadComponent;
	let fixture: ComponentFixture<LetterHeadComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ LetterHeadComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LetterHeadComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
