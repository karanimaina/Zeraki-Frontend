import { Component, Input, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { Collection } from "src/app/@core/models/litemore/invoice/collection/collection";
import { Invoice } from "src/app/@core/models/litemore/invoice/invoice";
import { OldInvoice } from "src/app/@core/models/litemore/invoice/old-invoice";
import { LitemoreSchoolProfile } from "src/app/@core/models/litemore/school/litemore-school-profile";
import { BdevService } from "src/app/@core/services/litemore/bdev/bdev.service";
import { CollectionService } from "src/app/@core/services/litemore/collection/collection.service";
import { DateFormatter } from "src/app/@core/shared/utilities/date-formatter";
import Swal from "sweetalert2";
import {TranslateService} from "@ngx-translate/core";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-manage-invoice-collections",
	templateUrl: "./manage-invoice-collections.component.html",
	styleUrls: ["./manage-invoice-collections.component.scss"]
})
export class ManageInvoiceCollectionsComponent implements OnInit {
	@Input() invoice!: Invoice | OldInvoice;
	@Input() schoolInfo!: LitemoreSchoolProfile;
	@Input() userInit!: any;

	invoiceCollections: Collection[] = [];
	editCollectionForm!: FormGroup;
	editableCollectionRows: { [key: string]: boolean } = {};

	constructor(
		private bdevService: BdevService,
		private collectionService: CollectionService,
		private fb: FormBuilder,
		private toastService: HotToastService,
		private responseHandler: ResponseHandlerService,
		private translate:TranslateService) { }

	ngOnInit(): void {
		this.getInvoiceCollections();
	}

	private getInvoiceCollections() {
		this.bdevService.getInvoiceCollections(this.invoice.invoiceId).subscribe(({ collections }) => {
			this.invoiceCollections = collections;
			this.initializeEditCollectionForm();
		});
	}

	private initializeEditCollectionForm() {
		const collectionFormControls = this.invoiceCollections.map((collection) => this.fb.group({
			collectionid: collection.collectionId,
			amount: collection.amount,
			additional_info: collection.additionalInfo,
			date: DateFormatter.formatToYyMmDd(collection.collectionDate, "-")
		}));

		this.editCollectionForm = this.fb.group({
			collections: this.fb.array(collectionFormControls)
		});
	}

	private get collectionsFormArray() {
		return this.editCollectionForm.get("collections") as FormArray;
	}

	confirmDelete(collectionIndex) {
		Swal.fire({
			title: this.translate.instant("litemore.bdevs.invoices.invoice.components.manageInvoiceCollections.collectionDate"),
			text: this.translate.instant("litemore.bdevs.invoices.invoice.components.manageInvoiceCollections.confirmDeleteCollection"),
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("litemore.bdevs.invoices.invoice.components.manageInvoiceCollections.delete"),
			cancelButtonText: this.translate.instant("litemore.bdevs.invoices.invoice.components.manageInvoiceCollections.cancel")
		}).then((result) => {
			if (result.isConfirmed) {
				this.deleteCollection(collectionIndex);
			}
		});
	}

	saveCollectionChanges(collectionIndex: number, collection: Collection) {
		const payload = this.getCollectionPayload(collectionIndex);

		this.collectionService.updateCollection(payload).subscribe((response: any) => {
			this.editCollection(payload.update_invoice_collection.collectionid);

			collection.amount = payload.update_invoice_collection.amount;
			collection.additionalInfo = payload.update_invoice_collection.additional_info;
			collection.collectionDate = payload.update_invoice_collection.date;

			this.toastService.success(response.message);
		}, (error) => {
			const message = error?.error?.message || "An error occurred while updating collection";
			this.toastService.error(message);
		});
	}

	private deleteCollection(collectionIndex: number) {
		const payload = this.getCollectionPayload(collectionIndex);
		payload.update_invoice_collection["remove"] = true;

		this.collectionService.updateCollection(payload).subscribe((response: any) => {
			this.invoiceCollections = this.invoiceCollections.filter((collection) => collection.collectionId !== payload.update_invoice_collection.collectionid);
			this.collectionsFormArray.removeAt(collectionIndex);

			this.toastService.success(response.message);
		}, (error) => {
			this.responseHandler.error(error, "deleteCollection()");
		});
	}

	private getCollectionPayload(collectionIndex) {
		const updatedCollection = this.collectionsFormArray.at(collectionIndex).value;
		updatedCollection["date"] = DateFormatter.formatToDdMmYy(updatedCollection["date"]);

		return {
			invoiceid: this.invoice.invoiceId,
			schoolid: this.schoolInfo.school.schoolId,
			update_invoice_collection: updatedCollection
		};
	}

	editCollection(collectionId: number) {
		this.editableCollectionRows[collectionId] = !this.editableCollectionRows[collectionId];
	}


	printCollection(collection) {
		collection.schoolName = this.schoolInfo.school.schoolName;
		collection.itemType = this.invoice.item;
		collection.customer_care_number = this.userInit.customer_care_number;
		this.bdevService.generateCollectionDocument(collection).subscribe(r => {
			this.toastService.success(this.translate.instant("litemore.bdevs.invoices.invoice.components.manageInvoiceCollections.downloadSuccess"));
		}, e => {
			console.log(e);
			this.toastService.error(this.translate.instant("litemore.bdevs.invoices.invoice.components.manageInvoiceCollections.downloadError"));
		});
	}
}
