import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges
} from "@angular/core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import {
	CreditNote,
	CreditNoteItem
} from "src/app/@core/models/litemore/invoice/credit-note/credit-note";
import { LitemoreUser1 } from "src/app/@core/models/litemore/users/litemore";
import { InvoiceService } from "src/app/@core/services/litemore/invoice/invoice.service";
import { LitemoreUserService } from "src/app/@core/services/litemore/user/litemore-user.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import Swal from "sweetalert2";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: "app-credit-notes-list",
	templateUrl: "./credit-notes-list.component.html",
	styleUrls: ["./credit-notes-list.component.scss"]
})
export class CreditNotesListComponent implements OnInit, OnChanges {
	@Input() creditNotes!: CreditNote[];

	@Output() creditNoteUpdated: EventEmitter<void> = new EventEmitter<void>();
	@Output() creditNoteDeleted: EventEmitter<number> =
		new EventEmitter<number>();
	@Output() showPrintCreditNotePreview: EventEmitter<CreditNoteItem> =
		new EventEmitter<CreditNoteItem>();

	updateCreditNoteForm!: FormGroup;

	updateCreditNote: { [key: number]: boolean } = {};
	updatingCreditNote: { [key: number]: boolean } = {};
	deletingCreditNote: { [key: number]: boolean } = {};
	loggedInUser!: LitemoreUser1;

	constructor(
		private fb: FormBuilder,
		private litemoreUserService: LitemoreUserService,
		private toastService: HotToastService,
		private responseHandler: ResponseHandlerService,
		private invoiceService: InvoiceService,
		private translate: TranslateService
	) {}

	ngOnInit(): void {
		this.getLoggedInUser();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.creditNotes) {
			this.initCreditNoteForm();
		}
	}

	private getLoggedInUser() {
		this.litemoreUserService.litemoreUser$.subscribe((user) => {
			this.loggedInUser = user;
		});
	}

	private initCreditNoteForm() {
		this.updateCreditNoteForm = this.fb.group({
			creditNotesArray: this.fb.array([])
		});
		this.getCreditNotesList();
	}

	get creditNotesArray() {
		return this.updateCreditNoteForm.controls["creditNotesArray"] as FormArray;
	}

	private getCreditNotesList() {
		this.creditNotes.map((creditNote) => {
			this.creditNotesArray.push(
				this.fb.group({
					creditNoteDescription: [creditNote.creditNoteDescription],
					creditNoteItemsArray: this.fb.array(
						this.getCreditNoteItems(creditNote)
					)
				})
			);
		});
	}

	private getCreditNoteItems(creditNote: any) {
		return creditNote.creditNoteItems.map((item) => {
			return this.fb.group({
				grossAmount: [item.grossAmount],
				creditNoteId: [item.creditNoteId]
			});
		});
	}

	printCreditNote(creditNoteItem: CreditNoteItem) {
		this.showPrintCreditNotePreview.emit(creditNoteItem);
	}

	enableEdit(creditNoteId: number) {
		this.updateCreditNote[creditNoteId] = !this.updateCreditNote[creditNoteId];
	}

	getCreditNoteFormGroup(creditNoteIndex: number) {
		return this.creditNotesArray.at(creditNoteIndex) as FormGroup;
	}

	getCreditNoteItemsArray(creditNoteIndex: number) {
		const itemsFormArray = this.getCreditNoteFormGroup(creditNoteIndex)
			.controls["creditNoteItemsArray"] as FormArray;
		return itemsFormArray;
	}

	saveCreditNoteChanges(creditNoteIndex: number, creditNoteItemIndex: number) {
		const creditNoteFormGroup =
			this.getCreditNoteItemsArray(creditNoteIndex).at(creditNoteItemIndex);

		if (creditNoteFormGroup.invalid) return;
		this.updatingCreditNote[creditNoteFormGroup.value.creditNoteId] = true;
		this.invoiceService.updateCreditNote(creditNoteFormGroup.value).subscribe({
			next: () => {
				this.updateCreditNote[creditNoteFormGroup.value.creditNoteId] = false;
				this.updatingCreditNote[creditNoteFormGroup.value.creditNoteId] = false;
				this.toastService.success("Credit note updated successfully");
				this.creditNoteUpdated.emit();
			},
			error: (err) => {
				this.updatingCreditNote[creditNoteFormGroup.value.creditNoteId] = false;
				this.responseHandler.error(err, "saveCreditNoteChanges()");
			}
		});
	}

	confirmDeleteCreditNote(creditNoteId: number) {
		Swal.fire({
			title: this.translate.instant(
				"litemore.bdevs.invoices.invoice.components.createNotesList.deleteCreditNote"
			),
			text: this.translate.instant(
				"litemore.bdevs.invoices.invoice.components.createNotesList.confirmDeleteCreditNote"
			),
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant(
				"litemore.bdevs.invoices.invoice.components.createNotesList.yesDelete"
			),
			cancelButtonText: this.translate.instant(
				"litemore.bdevs.invoices.invoice.components.createNotesList.cancel"
			)
		}).then((result) => {
			if (result.isConfirmed) {
				this.deleteCreditNote(creditNoteId);
			}
		});
	}

	deleteCreditNote(creditNoteId: number) {
		this.deletingCreditNote[creditNoteId] = true;
		this.invoiceService.deleteCreditNote(creditNoteId).subscribe({
			next: () => {
				this.deletingCreditNote[creditNoteId] = false;
				this.toastService.success(
					this.translate.instant(
						"litemore.bdevs.invoices.invoice.components.createNotesList.deleteSuccess"
					)
				);
				this.creditNoteDeleted.emit(creditNoteId);
			},
			error: (err) => {
				this.deletingCreditNote[creditNoteId] = false;
				this.responseHandler.error(err, "deleteCreditNote()");
			}
		});
	}
}
