import { CurrencyPipe } from "@angular/common";
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { Observable, Subject } from "rxjs";
import { startWith, takeUntil } from "rxjs/operators";
import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";
import { CreateInvoice, UpdateInvoice } from "src/app/@core/models/invoice/invoice";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import { InvoiceService, Votehead } from "src/app/@core/services/litemore/invoice/invoice.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-create-invoice",
	templateUrl: "./create-invoice.component.html",
	styleUrls: ["./create-invoice.component.scss"]
})
export class CreateInvoiceComponent implements OnInit, OnDestroy {
	readonly LitemoreUserRole = LitemoreUserRole;
	destroy$: Subject<boolean> = new Subject();
	voteHeads$: Observable<Array<Votehead>> = this.invoiceService.getInvoiceVoteHeads();

	@Input() isUpdateInvoice = false;
	@Input() invoice: any;
	@Input() proforma!: any;
	@Input() routeParams?: any;
	@Input() schoolInfo: any;
	@Output() showInvoiceTable: EventEmitter<boolean> = new EventEmitter();
	@Output() reloadInvoices: EventEmitter<number> = new EventEmitter();

	createInvoiceForm!: SubmitFormGroup;
	grossAmount = 0;
	netAmount = 0;
	vat = 0;

	constructor(
		private invoiceService: InvoiceService,
		private toastService: HotToastService,
		private responseHandler: ResponseHandlerService,
		private currencyPipe: CurrencyPipe
	) { }

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.bindForm();
	}

	bindForm() {
		const defaultVoteHeads = this.proforma?.voteHeads?.map(votehead => {
			return votehead.typeId;
		});
		const selectedVoteHeads = this.invoice?.invoiceItems?.map(item => {
			return item.itemTypeId;
		});
		console.warn("selectedVoteHeads", selectedVoteHeads);

		this.createInvoiceForm = new SubmitFormGroup({
			voteHead: new FormControl(this.isUpdateInvoice? { value: selectedVoteHeads, disabled: true }: defaultVoteHeads, [Validators.required]),
			setupGrossAmount: new FormControl(this.isUpdateInvoice? { value: this.getEditValue(1), disabled: true }: ""),
			fullYearSubGross: new FormControl(this.isUpdateInvoice? { value: this.getEditValue(2), disabled: true }: ""),
			renewalGrossAmount: new FormControl(this.isUpdateInvoice? { value: this.getEditValue(2), disabled: true }: ""),
			senderIdAmount: new FormControl(this.isUpdateInvoice? { value: this.getEditValue(3), disabled: true }: ""),
			bulkSmsAmount: new FormControl(this.isUpdateInvoice? { value: this.getEditValue(4), disabled: true }: ""),
			ztAmount: new FormControl(this.isUpdateInvoice? { value: this.getEditValue(5), disabled: true }: ""),
			zfAmount: new FormControl(this.isUpdateInvoice? { value: this.getEditValue(6), disabled: true }: ""),
			zfRenewal: new FormControl(this.isUpdateInvoice? { value: this.getEditValue(7), disabled: true }: ""),
			invoiceDueDate: new FormControl(""),
			extensionDate: new FormControl(""),
		});
		this.calculateGrossAmount();
	}

	getEditValue(itemTypeId: number) {
		const itemData = this.invoice?.invoiceItems?.filter(item => item.itemTypeId === itemTypeId);
		console.warn("itemData >> ", itemData);
		return itemData[0]?.invoiceAmount || 0;
	}

	calculateGrossAmount() {
		this.createInvoiceForm.valueChanges.pipe(startWith(this.createInvoiceForm.getRawValue)).subscribe(value => {

			const grossAmount =
				(this.voteHead?.value?.includes(1) ? (this.setupGrossAmount?.value || 0) : 0) +
				(this.voteHead?.value?.includes(2) ? (this.renewalGrossAmount?.value || 0) : 0) +
				(this.voteHead?.value?.includes(3) ? (this.senderIdAmount?.value || 0) : 0) +
				(this.voteHead?.value?.includes(4) ? (this.bulkSmsAmount?.value || 0) : 0) +
				(this.voteHead?.value?.includes(5) ? (this.ztAmount?.value || 0) : 0) +
				(this.voteHead?.value?.includes(6) ? (this.zfAmount?.value || 0) : 0) +
				(this.voteHead?.value?.includes(7) ? (this.zfRenewal?.value || 0) : 0);


			this.grossAmount = grossAmount;
			this.vat = (this.grossAmount - (this.grossAmount / 1.16));
			this.netAmount = (this.grossAmount / 1.16);
		});
	}

	get bulkSmsAmount() {
		return this.createInvoiceForm.get("bulkSmsAmount");
	}
	get ztAmount() {
		return this.createInvoiceForm.get("ztAmount");
	}
	get zfAmount() {
		return this.createInvoiceForm.get("zfAmount");
	}
	get zfRenewal() {
		return this.createInvoiceForm.get("zfRenewal");
	}
	get voteHead() {
		return this.createInvoiceForm.get("voteHead");
	}
	get senderIdAmount() {
		return this.createInvoiceForm.get("senderIdAmount");
	}
	get renewalGrossAmount() {
		return this.createInvoiceForm.get("renewalGrossAmount");
	}
	get setupGrossAmount() {
		return this.createInvoiceForm.get("setupGrossAmount");
	}
	get fullYearSubGross() {
		return this.createInvoiceForm.get("fullYearSubGross");
	}
	get invoiceDueDate() {
		return this.createInvoiceForm.get("invoiceDueDate");
	}
	get extensionDate() {
		return this.createInvoiceForm.get("extensionDate");
	}

	createInvoice() {
		if (this.grossAmount > this.schoolInfo.balance) {
			this.toastService.warning(`Invoice amount can't be greater than Current balance of <b>${this.currencyPipe.transform(this.schoolInfo.balance)}</b>`);
		} else {
			const invoice: CreateInvoice & UpdateInvoice = {
				grossAmount: this.grossAmount,
				schoolId: +this.routeParams.school_id,
				invoiceItems: []
			};

			if (this.isUpdateInvoice) {
				invoice.invoiceId = this.invoice.invoiceId;
				invoice.extensionDate = Date.parse(this.extensionDate?.value);
			} else {
				invoice.proformaInvoiceId = +this.routeParams.proforma_id;
				invoice.dueDate = Date.parse(this.invoiceDueDate?.value);
			}

			if (this.voteHead?.value?.includes(1)) {
				invoice.invoiceItems.push(
					{
						itemTypeId: 1,
						grossAmount: this.setupGrossAmount?.value,
					}
				);
			}
			if (this.voteHead?.value?.includes(2)) {
				invoice.invoiceItems.push({ itemTypeId: 2, grossAmount: this.renewalGrossAmount?.value });
			}
			if (this.voteHead?.value?.includes(3)) {
				invoice.invoiceItems.push({ itemTypeId: 3, grossAmount: this.senderIdAmount?.value });
			}
			if (this.voteHead?.value?.includes(4)) {
				invoice.invoiceItems.push({ itemTypeId: 4, grossAmount: this.bulkSmsAmount?.value });
			}
			if (this.voteHead?.value?.includes(5)) {
				invoice.invoiceItems.push({ itemTypeId: 5, grossAmount: this.ztAmount?.value });
			}
			if (this.voteHead?.value?.includes(6)) {
				invoice.invoiceItems.push({ itemTypeId: 6, grossAmount: this.zfAmount?.value });
			}
			if (this.voteHead?.value?.includes(7)) {
				invoice.invoiceItems.push({ itemTypeId: 7, grossAmount: this.zfRenewal?.value });
			}

			// console.log("payload:", invoice);
			this.invoiceService.createInvoice(invoice, this.isUpdateInvoice).pipe(takeUntil(this.destroy$)).subscribe({
				next: resp => {
					this.responseHandler.success(resp);
					this.reloadInvoices.emit();
				},
				error: err => {
					this.responseHandler.error(err, "createInvoice()");
				}
			});
		}
	}

	cancel() {
		this.showInvoiceTable.emit();
	}

}
