import { ComponentFixture, TestBed } from "@angular/core/testing";

import { WhatsappDialogComponent } from "./whatsapp-dialog.component";

describe("WhatsappDialogComponent", () => {
	let component: WhatsappDialogComponent;
	let fixture: ComponentFixture<WhatsappDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ WhatsappDialogComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(WhatsappDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
