import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CollectionReceiptComponent } from "./collection-receipt.component";
import {NormalizeTextPipe, NumberToWordsPipe} from "../../../../../../@core/shared";
import {Component} from "@angular/core";

describe("CollectionReceiptComponent", () => {
	let component: TestCollectionReceiptComponent;
	let fixture: ComponentFixture<TestCollectionReceiptComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [
				CollectionReceiptComponent,
				TestCollectionReceiptComponent,
				NormalizeTextPipe,
				NumberToWordsPipe
			]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TestCollectionReceiptComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});

	@Component({
		selector: "test-collection-receipt",
		template: `
			<app-collection-receipt [collection]="collection" [studentData]="studentData"></app-collection-receipt>
		`
	})
	class TestCollectionReceiptComponent {
		collection = {
			receiptNo: "ZERAKI-2021-0000001",
			txnDate: "2021-01-01",
			studentName: "John Doe",
			admissionNo: "ADM/001",
			intakeName: "Form 1",
		};

		studentData = {
			studentName: "John Doe",
			currentStreamName: "1 East"
		};
	}
});
