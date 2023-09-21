import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { LitemoreSchoolProfile } from "src/app/@core/models/litemore/school/litemore-school-profile";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import { InvoiceService } from "src/app/@core/services/litemore/invoice/invoice.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { CollectionPayload } from "../../../models/colecction";

@Component({
	selector: "app-add-collection",
	templateUrl: "./add-collection.component.html",
	styleUrls: ["./add-collection.component.scss"]
})
export class AddCollectionComponent implements OnInit {
	@Input() loggedInUser: any;
	@Input() routeParams: any;
	@Input() currentInvoice: any;
	@Input() schoolInfo!: LitemoreSchoolProfile;
	@Output() reloadInvoices: EventEmitter<number> = new EventEmitter();
	@Output() reloadBalance: EventEmitter<void> = new EventEmitter();
	addCollectionForm!: SubmitFormGroup;
	today = new Date().toLocaleDateString("fr-ca");

	constructor(
		private invoiceService: InvoiceService,
		private responseHandler: ResponseHandlerService
	) {}

	ngOnInit(): void {
		this.bindForm();
	}

	get showOverPaymentDialog(): boolean {
		return this.schoolInfo.balance < 0;
	}

	bindForm() {
		this.addCollectionForm = new SubmitFormGroup({
			collectionAmount: new FormControl("", [Validators.required]),
			collectionMethod: new FormControl(""),
			collectionDate: new FormControl("", [Validators.required]),
			userOverPayment: new FormControl(false)
		});
		this.watchUseOverPayment();
	}

	watchUseOverPayment() {
		this.userOverPayment?.valueChanges.subscribe((value) => {
			console.warn("value >> ", value);
			value
				? this.handleUseOverPayment()
				: this.collectionAmount?.patchValue("");
		});
	}

	get collectionAmount() {
		return this.addCollectionForm.get("collectionAmount");
	}

	get collectionMethod() {
		return this.addCollectionForm.get("collectionMethod");
	}

	get collectionDate() {
		return this.addCollectionForm.get("collectionDate");
	}

	get userOverPayment() {
		return this.addCollectionForm.get("userOverPayment");
	}

	addCollection() {
		const collectionPayload: CollectionPayload = {
			invoiceId: this.currentInvoice.invoiceId,
			schoolId: this.routeParams.school_id,
			amount: this.collectionAmount?.value,
			additionalInfo: this.collectionMethod?.value,
			collectionDate: Date.parse(this.collectionDate?.value),
			useSchoolBalance: this.userOverPayment?.value
		};
		this.invoiceService.addCollection(collectionPayload).subscribe({
			next: (response) => {
				this.responseHandler.success(response);
				this.reloadInvoices.emit();
				this.reloadBalance.emit();
			},
			error: (err) => {
				this.responseHandler.error(err, "addCollection()");
			}
		});
	}

	handleUseOverPayment() {
		const schoolBalance = Math.abs(this.schoolInfo.balance);
		console.warn(this.currentInvoice);
		if (schoolBalance > this.currentInvoice.balance)
			this.collectionAmount?.patchValue(this.currentInvoice.balance);
	}
}
