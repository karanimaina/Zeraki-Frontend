import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output
} from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { NewCreditNote } from "src/app/@core/models/litemore/invoice/credit-note/new-credit-note";
import { Invoice } from "src/app/@core/models/litemore/invoice/invoice";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import { InvoiceService } from "src/app/@core/services/litemore/invoice/invoice.service";
import { emptyStringValidator } from "src/app/@core/shared/directives/empty-string-validator.directive";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: "app-create-credit-note",
	templateUrl: "./create-credit-note.component.html",
	styleUrls: ["./create-credit-note.component.scss"]
})
export class CreateCreditNoteComponent implements OnInit, OnDestroy {
	@Input() invoice!: Invoice;
	@Output() creditNoteCreated: EventEmitter<void> = new EventEmitter<void>();

	creditNoteForm!: SubmitFormGroup;
	loading = false;
	itemTypes!: Array<number>;
	destroy$: Subject<boolean> = new Subject();

	constructor(
		private invoiceService: InvoiceService,
		private responseHandler: ResponseHandlerService,
		private toastService: HotToastService,
		private translate: TranslateService
	) {}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.initializeCreditNoteForm();
		this.watchItems();
	}

	private initializeCreditNoteForm() {
		this.creditNoteForm = new SubmitFormGroup({
			item: new FormControl("", [Validators.required, emptyStringValidator]),
			creditNoteDescription: new FormControl("", [
				Validators.required,
				emptyStringValidator
			])
		});
		this.populateAmountControls();
	}

	populateAmountControls() {
		for (const item of this.invoice.invoiceItems) {
			this.creditNoteForm.addControl(
				`${item.itemTypeId}Amount`,
				new FormControl(null)
			);
			this.creditNoteForm.addControl(
				`${item.itemTypeId}Amount`,
				new FormControl(null)
			);
		}
	}

	watchItems() {
		this.item?.valueChanges.subscribe((value) => {
			this.itemTypes = value?.map((item) => item?.itemTypeId);
		});
	}

	getDynamicControlName(itemId: number) {
		return this.creditNoteForm.get(`${itemId}Amount`);
	}

	get creditNoteDescription() {
		return this.creditNoteForm.get("creditNoteDescription");
	}

	get item() {
		return this.creditNoteForm.get("item");
	}

	createCreditNote() {
		if (this.creditNoteForm.invalid) return;

		this.loading = true;
		const creditNote: NewCreditNote = {
			creditNoteDescription: this.creditNoteDescription?.value,
			creditNoteItems: []
		};

		for (const item of this.invoice.invoiceItems) {
			if (this.itemTypes?.includes(item.itemTypeId)) {
				creditNote.creditNoteItems.push({
					invoiceItemId: item?.itemId,
					grossAmount: this.getDynamicControlName(item.itemTypeId)?.value
				});
			}
		}

		this.invoiceService
			.createCreditNote(creditNote)
			.pipe(
				finalize(() => (this.loading = false)),
				takeUntil(this.destroy$)
			)
			.subscribe({
				next: (resp) => {
					this.responseHandler.success(resp);
					this.creditNoteCreated.emit();
				},
				error: (err) => {
					this.responseHandler.error(err, "createCreditNote()");
				}
			});
	}
}
