import { Component, OnDestroy, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { HotToastService } from "@ngneat/hot-toast";
import { takeUntil } from "rxjs/operators";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { LitemoreSchoolProfile } from "src/app/@core/models/litemore/school/litemore-school-profile";
import {
	CreditNote,
	CreditNoteItem
} from "src/app/@core/models/litemore/invoice/credit-note/credit-note";
import { BdevService } from "src/app/@core/services/litemore/bdev/bdev.service";
import { InvoiceService } from "src/app/@core/services/litemore/invoice/invoice.service";
import { LitemoreUserService } from "src/app/@core/services/litemore/user/litemore-user.service";
import { LitemoreUser1 } from "src/app/@core/models/litemore/users/litemore";
import {
	Invoice,
	Invoices
} from "src/app/@core/models/litemore/invoice/invoice";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: "app-credit-notes",
	templateUrl: "./credit-notes.component.html",
	styleUrls: ["./credit-notes.component.scss"]
})
export class CreditNotesComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	invoiceId!: number;
	userInit: any;
	schoolInfo!: LitemoreSchoolProfile;

	creditNotes: CreditNote[] = [];
	selectedCreditNote!: CreditNoteItem;
	invoice!: Invoice;
	vatRate!: string;
	kraPin!: string;

	createCreditNote = false;
	printCreditNote = false;
	loggedInUser!: LitemoreUser1;
	invoices!: Invoices;

	constructor(
		private bdevService: BdevService,
		private litemoreUserService: LitemoreUserService,
		private dataService: DataService,
		private location: Location,
		private activatedRoute: ActivatedRoute,
		private invoiceService: InvoiceService,
		public Location: Location,
		private toastService: HotToastService,
		private translate: TranslateService
	) {}

	ngOnInit(): void {
		this.invoiceId = this.activatedRoute.snapshot.params["invoiceId"];
		this.getLoggeInUser();
		this.loadUserInit();
		this.getSchoolInfo();
		this.getInvoice();
		this.getCreditNotes();
	}

	ngOnDestroy() {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	private getLoggeInUser() {
		this.litemoreUserService.litemoreUser$.subscribe((user) => {
			this.loggedInUser = this.litemoreUserService.initLitemoreUser(user);
		});
	}

	private loadUserInit() {
		this.dataService.userInitSubject.subscribe((userInit) => {
			this.userInit = userInit;
		});
	}

	private getSchoolInfo() {
		this.bdevService.getSchoolInfo().subscribe((schoolInfo) => {
			this.schoolInfo = schoolInfo;
		});
	}

	private getInvoice(refresh = false) {
		if (refresh) {
			this.invoiceService.setInvoicesFromProforma(
				this.schoolInfo.school.schoolId,
				this.invoices.proformaId,
				true,
				"?currentPage=1"
			);
			this.bdevService.setSchoolInfo(this.schoolInfo.school.schoolId);
		}
		this.invoiceService.getInvoicesFromProforma().subscribe((invoices) => {
			if (invoices) {
				this.invoices = invoices;
				this.invoice = invoices.invoices.find(
					(invoice) => invoice.invoiceId == this.invoiceId
				)!;
			}
		});
	}

	get showCreditNotes() {
		return !this.createCreditNote && !this.printCreditNote;
	}

	get showCreateCreditNote() {
		return this.createCreditNote;
	}

	get showCreditNotePrintPreview() {
		return this.printCreditNote && !this.createCreditNote;
	}

	getCreditNotes() {
		this.invoiceService
			.getCreditNotesData(this.invoiceId)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (creditNotesData) => {
					this.creditNotes = creditNotesData.creditNotes;
					this.kraPin = creditNotesData.kraPin;
					this.vatRate = creditNotesData.vatRate;
				},
				error: (err) => {
					this.toastService.error(
						this.translate.instant(
							"litemore.bdevs.invoices.invoice.creditNotes.failedToLoadCreditNotes"
						)
					);
				}
			});
	}

	goBack() {
		this.location.back();
	}

	setCreditNote() {
		this.createCreditNote = !this.createCreditNote;
	}

	// removeCreditNoteFromList(creditNoteId: number) {
	// 	this.creditNotes = this.creditNotes.filter(creditNote => creditNote.creditNoteId != creditNoteId);
	// }

	updateCreditNoteList() {
		this.setCreditNote();
		this.getCreditNotes();
		this.getInvoice(true);
	}

	printSelectedCreditNote(creditNote: CreditNoteItem) {
		this.selectedCreditNote = creditNote;
		this.printCreditNote = true;
	}

	closeCreditNotePreview() {
		this.printCreditNote = false;
	}

	back() {
		this.location.back();
	}
}
