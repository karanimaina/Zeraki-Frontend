import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import * as moment from "moment";
import { Observable, Subject } from "rxjs";
import { startWith, takeUntil } from "rxjs/operators";
import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";
import { CreateProforma } from "src/app/@core/models/invoice/proforma";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import { InvoiceService, Votehead } from "src/app/@core/services/litemore/invoice/invoice.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-create-proforma",
	templateUrl: "./create-proforma.component.html",
	styleUrls: ["./create-proforma.component.scss"]
})
export class CreateProformaComponent implements OnInit, OnDestroy {
	readonly LitemoreUserRole = LitemoreUserRole;
	destroy$: Subject<boolean> = new Subject();

	@Input() routeParams: any;
	@Input() isUpdateProforma = false;
	@Input() proforma: any;
	@Output() closeCreate: EventEmitter<boolean> = new EventEmitter();
	@Output() createSuccess: EventEmitter<boolean> = new EventEmitter();
	voteHeads$: Observable<Array<Votehead>> = this._invoiceService.getInvoiceVoteHeads();
	createProformaForm!: SubmitFormGroup;
	grossAmount = 0;

	constructor(
		private _invoiceService: InvoiceService,
		private _responseHandler: ResponseHandlerService
	) { }

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.bindForm();
	}

	close() {
		this.closeCreate.emit();
	}

	calculateGrossAmount() {
		this.createProformaForm.valueChanges.pipe(startWith(this.createProformaForm.getRawValue)).subscribe(value => {

			const grossAmount =
			(this.voteHead?.value?.includes(1)? (this.setupGrossAmount?.value || 0): 0) +
			(this.voteHead?.value?.includes(1)? (this.fullYearSubGross?.value || 0): 0) +
			(this.voteHead?.value?.includes(2)? (this.renewalGrossAmount?.value || 0): 0) +
			(this.voteHead?.value?.includes(3)? (this.senderIdAmount?.value || 0): 0) +
			(this.voteHead?.value?.includes(4)? (this.bulkSmsAmount?.value || 0): 0) +
			(this.voteHead?.value?.includes(5)? (this.ztAmount?.value || 0): 0) +
			(this.voteHead?.value?.includes(6)? (this.zfAmount?.value || 0): 0) +
			(this.voteHead?.value?.includes(7)? (this.zfRenewal?.value || 0): 0);


			this.grossAmount = grossAmount;
		});
	}

	bindForm() {
		const selectedVoteHeads = this.proforma?.proformaItems?.map(proforma => {
			return proforma.itemTypeId;
		});

		this.createProformaForm = new SubmitFormGroup({
			voteHead: new FormControl(this.isUpdateProforma? selectedVoteHeads: "", [Validators.required]),
			setupGrossAmount: new FormControl(this.isUpdateProforma? this.getEditValue(1).setupGrossAmount: ""),
			fullYearSubGross: new FormControl(this.isUpdateProforma? this.getEditValue(1).fullYearGrossAmount: ""),
			renewalGrossAmount: new FormControl(this.isUpdateProforma? this.getEditValue(2): ""),
			senderIdAmount: new FormControl(this.isUpdateProforma? this.getEditValue(3): ""),
			bulkSmsAmount: new FormControl(this.isUpdateProforma? this.getEditValue(4): ""),
			ztAmount: new FormControl(this.isUpdateProforma? this.getEditValue(5): ""),
			zfAmount: new FormControl(this.isUpdateProforma? this.getEditValue(6): ""),
			zfRenewal: new FormControl(this.isUpdateProforma? this.getEditValue(7): ""),
			profomaDueDate: new FormControl(this.isUpdateProforma? moment(this.proforma?.dueDate, "DD/MM/YYYY").format("YYYY-MM-DD"): ""),
			extensionDate: new FormControl(""),
		});

		if (this.isUpdateProforma) this.voteHead?.disable();
		this.calculateGrossAmount();
	}

	getEditValue(itemTypeId: number) {
		const itemData = this.proforma?.proformaItems?.filter(item => item.itemTypeId === itemTypeId);

		if (itemTypeId != 1) return itemData[0]?.grossAmount || 0;
		const setupData = {
			setupGrossAmount: itemData[0]?.setupGrossAmount || 0,
			fullYearGrossAmount: itemData[0]?.fullYearGrossAmount || 0,
			dueDate: moment(itemData[0]?.dueDate, "DD/MM/YYYY").format("YYYY-MM-DD")
		};
		return setupData;
	}

	get bulkSmsAmount() {
		return this.createProformaForm.get("bulkSmsAmount");
	}
	get ztAmount() {
		return this.createProformaForm.get("ztAmount");
	}
	get zfAmount() {
		return this.createProformaForm.get("zfAmount");
	}
	get zfRenewal() {
		return this.createProformaForm.get("zfRenewal");
	}
	get voteHead() {
		return this.createProformaForm.get("voteHead");
	}
	get senderIdAmount() {
		return this.createProformaForm.get("senderIdAmount");
	}
	get renewalGrossAmount() {
		return this.createProformaForm.get("renewalGrossAmount");
	}
	get setupGrossAmount() {
		return this.createProformaForm.get("setupGrossAmount");
	}
	get fullYearSubGross() {
		return this.createProformaForm.get("fullYearSubGross");
	}
	get profomaDueDate() {
		return this.createProformaForm.get("profomaDueDate");
	}
	get extensionDate() {
		return this.createProformaForm.get("extensionDate");
	}

	createProfomaInvoice() {
		const proformaInvoice: CreateProforma = {
			schoolId: +this.routeParams.school_id,
			hasOptions: false,
			proformaItems: [],
		};

		if (this.isUpdateProforma) {
			proformaInvoice.proformaId = this.proforma?.proformaId;
			proformaInvoice.extensionDate = Date.parse(this.extensionDate?.value);
		} else {
			proformaInvoice.dueDate = Date.parse(this.profomaDueDate?.value);
		}

		if (this.voteHead?.value?.includes(1) && !this.isUpdateProforma) {
			proformaInvoice.proformaItems.push(
				{
					itemTypeId: 1,
					renewal: {
						grossAmount: this.fullYearSubGross?.value,
					},
					setup: {
						grossAmount: this.setupGrossAmount?.value,
					},
				}
			);
			proformaInvoice.hasOptions = true;
		}
		if (this.voteHead?.value?.includes(1) && this.isUpdateProforma) {
			proformaInvoice.proformaItems.push({ itemTypeId: 1, grossAmount: this.setupGrossAmount?.value });
		}
		if (this.voteHead?.value?.includes(2)) {
			proformaInvoice.proformaItems.push({ itemTypeId: 2, grossAmount: this.renewalGrossAmount?.value });
		}
		if (this.voteHead?.value?.includes(3)) {
			proformaInvoice.proformaItems.push({ itemTypeId: 3, grossAmount: this.senderIdAmount?.value });
		}
		if (this.voteHead?.value?.includes(4)) {
			proformaInvoice.proformaItems.push({ itemTypeId: 4, grossAmount: this.bulkSmsAmount?.value });
		}
		if (this.voteHead?.value?.includes(5)) {
			proformaInvoice.proformaItems.push({ itemTypeId: 5, grossAmount: this.ztAmount?.value });
		}
		if (this.voteHead?.value?.includes(6)) {
			proformaInvoice.proformaItems.push({ itemTypeId: 6, grossAmount: this.zfAmount?.value });
		}
		if (this.voteHead?.value?.includes(7)) {
			proformaInvoice.proformaItems.push({ itemTypeId: 7, grossAmount: this.zfRenewal?.value });
		}

		this._invoiceService.createProformaInvoice(proformaInvoice, this.isUpdateProforma).pipe(takeUntil(this.destroy$)).subscribe({
			next: resp => {
				this._responseHandler.success(resp, "createProfomaInvoice()");
			},
			error: err => {
				this._responseHandler.error(err, "createProfomaInvoice()");
			},
			complete: () => {
				this.createSuccess.emit();
			}
		});
	}

}
