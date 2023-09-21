import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EditSenderidComponent } from "./edit-senderid.component";

describe("EditSenderidComponent", () => {
	let component: EditSenderidComponent;
	let fixture: ComponentFixture<EditSenderidComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ EditSenderidComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(EditSenderidComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
