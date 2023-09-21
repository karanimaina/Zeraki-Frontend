import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Observable } from "rxjs";
import { LitemoreSchoolTypes } from "src/app/@core/models/litemore-schools";
import { reportType } from "src/app/@core/models/litemore/reports/reports";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import { BdevService } from "src/app/@core/services/litemore/bdev/bdev.service";
import {
	InvoiceService,
	Votehead
} from "src/app/@core/services/litemore/invoice/invoice.service";
import SchoolsTypeState from "src/app/@core/services/litemore/states/schools-type.state";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-report",
	templateUrl: "./report.component.html",
	styleUrls: ["./report.component.scss"]
})
export class ReportComponent implements OnInit {
	reportsType?: reportType;
	reportsForm!: FormGroup;
	filterForm?: SubmitFormGroup;
	voteHeads$: Observable<Array<Votehead>> =
		this._invoiceService.getInvoiceVoteHeads();
	schoolsTypes$: Observable<LitemoreSchoolTypes | null> =
		this.schoolsTypeState.schoolsTypes$;
	paymentStatuses: Array<"Paid" | "Unpaid" | "All"> = ["All", "Paid", "Unpaid"];

	constructor(
		private bdevService: BdevService,
		private responseHandler: ResponseHandlerService,
		private formBuilder: FormBuilder,
		private _invoiceService: InvoiceService,
		private schoolsTypeState: SchoolsTypeState
	) {}

	ngOnInit(): void {
		this._invoiceService.setInvoiceVoteHeads();
		this.bindForm();
	}

	bindForm() {
		this.reportsForm = this.formBuilder.group({
			startDate: [""],
			endDate: [""],
			dueDate: [""],
			itemType: [""],
			schoolSignUpDate: [""],
			product: [""],
			paymentStatus: [""]
		});
	}

	bindFilterForm(filterForm: any) {
		this.filterForm = filterForm;
	}

	get startDate() {
		return this.reportsForm.get("startDate");
	}
	get endDate() {
		return this.reportsForm.get("endDate");
	}
	get dueDate() {
		return this.reportsForm.get("dueDate");
	}
	get itemType() {
		return this.reportsForm.get("itemType");
	}
	get paymentStatus() {
		return this.reportsForm.get("paymentStatus");
	}
	get schoolSignUpDate() {
		return this.reportsForm.get("schoolSignUpDate");
	}
	get product() {
		return this.reportsForm.get("product");
	}

	fetchReports() {
		let type = "invoiceReport";
		let params = "?";
		this.filterForm?.value.checkArray.includes("startDate") &&
		this.startDate?.value
			? (params += `startDate=${this.startDate?.value}`)
			: "";
		this.filterForm?.value.checkArray.includes("startDate") &&
		this.endDate?.value
			? (params += `&endDate=${this.endDate?.value}`)
			: "";
		this.filterForm?.value.checkArray.includes("dueDate") && this.dueDate?.value
			? (params += `&dueDate=${this.dueDate?.value}`)
			: "";
		this.filterForm?.value.checkArray.includes("schoolSignUpDate") &&
		this.schoolSignUpDate?.value
			? (params += `&schoolSignUpDate=${this.schoolSignUpDate?.value}`)
			: "";
		this.filterForm?.value.checkArray.includes("itemType") &&
		this.itemType?.value
			? (params += `&itemType=${this.itemType?.value}`)
			: "";
		this.filterForm?.value.checkArray.includes("product") && this.product?.value
			? (params += `&product=${this.product?.value}`)
			: "";
		switch (this.paymentStatus?.value) {
		case "Paid":
			params += "&paid=true";
			break;
		case "Unpaid":
			params += "&paid=false";
			break;

		default:
			break;
		}

		this.filterForm?.value.checkArray.includes("uninvoiced")
			? (params += "&uninvoiced=true")
			: "";

		switch (this.reportsType) {
		case "invoices":
			type = "invoiceReport";
			break;
		case "collections":
			type = "collection";
			break;
		case "proformas":
			type = "proforma";
			break;

		default:
			type = "invoiceReport";
			break;
		}

		// const isInvoice = (this.reportsType == "invoices" || this.reportsType == "proformas");
		this.bdevService.downloadReports(params, type).subscribe({
			next: (resp) => {
				// if (isInvoice) {
				// 	this.bdevService.exportInvoiceReports(resp, this.tableHeaders, `${this.reportsType?.toUpperCase()}`);
				// } else {
				// 	this.bdevService.exportCollectionReports(resp, "Collections");
				// }
				this.bdevService.exportInvoiceReports(
					resp,
					this.tableHeaders,
					`${this.reportsType?.toUpperCase()}`
				);
			},
			error: (err) => {
				this.responseHandler.error(err, "fetchReports()");
			}
		});
	}

	get defaultHeaders() {
		return [
			{ key: "schoolName" },
			{ key: "invoiceNumber" },
			{ key: "invoiceDate" },
			{ key: "invoiceItems" },
			{ key: "dueDate" },
			{ key: "accountManager" },
			{ key: "accountOwner" }
		];
	}

	get invoiceHeaders() {
		return [
			{ key: "netAmount" },
			{ key: "vat" },
			{ key: "grossAmount" },
			{ key: "collectedAmount" },
			{ key: "balance" }
		];
	}

	get tableHeaders() {
		// the 'key' refers to translation keys in as in en.json
		switch (this.reportsType) {
		case "invoices":
			return [
				...this.defaultHeaders,
				...this.invoiceHeaders,
				{ key: "creditNoteAmount" },
				{ key: "cuInvoiceNumber" },
				{ key: "cuSerialNumber" }
			];
		case "collections":
			return [
				...this.defaultHeaders,
				{ key: "amount" },
				{ key: "collectionDate" },
				{ key: "collectionBy" },
				{ key: "county" },
				{ key: "accountManager" },
				{ key: "accountOwner" },
				{ key: "additionalInfo" }
			];
		case "proformas":
			return [...this.defaultHeaders, ...this.invoiceHeaders];

		default:
			return this.defaultHeaders;
		}
	}

	changeReportType(type: any) {
		this.reportsType = type;
	}
}
